// Authentication Controller (JWT + Bcrypt + RBAC + DPDP Privacy)
// LifeLink – Smart Blood Donor Network

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db/client';
import { config } from '../config/env';
import { AuthenticatedRequest } from '../middleware/auth';
import { logAuditEvent } from '../services/auditService';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  role: z.enum(['DONOR', 'PATIENT', 'HOSPITAL', 'ADMIN']).default('DONOR'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req: Request, res: Response) {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const { email, password, fullName, phone, role } = parseResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        phone: phone || null,
        role,
        isVerified: false,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    await logAuditEvent('USER_REGISTER', user.id, { role }, req.ip, req.headers['user-agent']);

    return res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user,
    });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to register account.' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        donorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    await logAuditEvent('USER_LOGIN', user.id, { role: user.role }, req.ip, req.headers['user-agent']);

    const { passwordHash, ...safeUserData } = user;

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUserData,
    });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({ success: false, error: 'Login failed.' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        donorProfile: {
          include: {
            donationRecords: {
              orderBy: { donationDate: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const { passwordHash, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('[GetMe Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch user session.' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const { fullName, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        fullName: fullName || undefined,
        phone: phone || undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isVerified: true,
      },
    });

    await logAuditEvent('PROFILE_UPDATE', req.user.userId, { fullName, phone }, req.ip);

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    console.error('[UpdateProfile Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized.' });
    }

    const userId = req.user.userId;

    // DPDP compliant cascade removal
    await prisma.user.delete({
      where: { id: userId },
    });

    await logAuditEvent('ACCOUNT_DELETED', userId, { note: 'Self-requested erasure' }, req.ip);

    return res.json({
      success: true,
      message: 'Your account and personal data have been completely deleted in compliance with privacy regulations.',
    });
  } catch (error) {
    console.error('[DeleteAccount Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to delete account.' });
  }
}
