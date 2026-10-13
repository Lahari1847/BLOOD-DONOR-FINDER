// Emergency & Blood Requests Controller
// LifeLink – Smart Blood Donor Network

import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { getCompatibleDonorGroups } from '../services/compatibilityService';
import { calculateDonorRankingScore } from '../services/rankingService';
import { sendNotification } from '../services/notificationService';
import { logAuditEvent } from '../services/auditService';

const createRequestSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  unitsRequired: z.number().min(1).max(20).default(1),
  hospitalName: z.string().min(2, 'Hospital name is required'),
  city: z.string().min(2, 'City is required'),
  locality: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  requiredBy: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Valid required-by date/time is required',
  }),
  urgency: z.enum(['CRITICAL', 'HIGH', 'MEDIUM']).default('HIGH'),
  contactPreference: z.enum(['IN_APP', 'EMAIL', 'PHONE']).default('IN_APP'),
  note: z.string().max(500).optional(),
});

export async function createRequest(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const parseResult = createRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const data = parseResult.data;
    const requiredByDate = new Date(data.requiredBy);

    if (requiredByDate.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'Required-by timestamp must be in the future.',
      });
    }

    // 1. Anti-spam / Duplicate request detection
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingDuplicate = await prisma.bloodRequest.findFirst({
      where: {
        requesterId: req.user.userId,
        patientName: { equals: data.patientName.trim() },
        hospitalName: { equals: data.hospitalName.trim() },
        bloodGroup: data.bloodGroup,
        status: 'OPEN',
        createdAt: { gte: oneHourAgo },
      },
    });

    if (existingDuplicate) {
      return res.status(409).json({
        success: false,
        error: 'A duplicate open request for this patient and hospital was submitted recently. Please update the existing request.',
      });
    }

    // 2. Max active requests per requester rate control
    const activeCount = await prisma.bloodRequest.count({
      where: {
        requesterId: req.user.userId,
        status: 'OPEN',
      },
    });

    if (activeCount >= 5) {
      return res.status(429).json({
        success: false,
        error: 'You have reached the maximum of 5 concurrent active requests. Please close resolved requests first.',
      });
    }

    // 3. Create BloodRequest in DB
    const bloodRequest = await prisma.bloodRequest.create({
      data: {
        requesterId: req.user.userId,
        patientName: data.patientName,
        bloodGroup: data.bloodGroup,
        unitsRequired: data.unitsRequired,
        hospitalName: data.hospitalName,
        city: data.city,
        locality: data.locality || null,
        pincode: data.pincode || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        requiredBy: requiredByDate,
        urgency: data.urgency,
        contactPreference: data.contactPreference,
        note: data.note || null,
        status: 'OPEN',
      },
    });

    await logAuditEvent('BLOOD_REQUEST_CREATED', req.user.userId, {
      requestId: bloodRequest.id,
      bloodGroup: data.bloodGroup,
      urgency: data.urgency,
    });

    // 4. Find matching nearby available donors and notify top candidates
    const compatibleGroups = getCompatibleDonorGroups(data.bloodGroup);
    const potentialDonors = await prisma.donorProfile.findMany({
      where: {
        bloodGroup: { in: compatibleGroups },
        isAvailable: true,
        consentGiven: true,
        isPublic: true,
      },
      include: {
        user: { select: { id: true, email: true, fullName: true } },
      },
      take: 20,
    });

    // Evaluate matching scores
    const topMatches = potentialDonors
      .map((donor) => {
        const ranking = calculateDonorRankingScore(
          data.bloodGroup,
          { latitude: data.latitude, longitude: data.longitude, city: data.city },
          donor
        );
        return { donor, ranking };
      })
      .filter((m) => m.ranking.isEligible)
      .sort((a, b) => b.ranking.totalScore - a.ranking.totalScore)
      .slice(0, 5); // top 5 candidates

    // Create Match records and dispatch notifications
    for (const match of topMatches) {
      await prisma.match.create({
        data: {
          requestId: bloodRequest.id,
          donorId: match.donor.id,
          score: match.ranking.totalScore,
          distanceKm: match.ranking.distanceKm,
          compatibility: match.ranking.compatibilityType,
          breakdownJson: JSON.stringify(match.ranking.breakdown),
          status: 'SUGGESTED',
        },
      });

      // Dispatch alert to donor
      await sendNotification({
        userId: match.donor.userId,
        recipientEmail: match.donor.user.email,
        title: `Urgent Match: ${data.urgency} Blood Request in ${data.city}`,
        message: `A patient at ${data.hospitalName} urgently requires ${data.bloodGroup} blood (${data.unitsRequired} unit/s). Match priority score: ${match.ranking.totalScore}/100.`,
        type: 'EMERGENCY',
        data: { requestId: bloodRequest.id, urgency: data.urgency },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Emergency blood request published successfully.',
      bloodRequest,
      matchedDonorsCount: topMatches.length,
    });
  } catch (error) {
    console.error('[CreateRequest Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to create blood request.' });
  }
}

export async function listEmergencyRequests(req: Request, res: Response) {
  try {
    const { bloodGroup, city, urgency } = req.query;

    const now = new Date();

    // Auto-expire outdated requests
    await prisma.bloodRequest.updateMany({
      where: {
        status: 'OPEN',
        requiredBy: { lt: now },
      },
      data: { status: 'EXPIRED' },
    });

    const whereClause: any = {
      status: 'OPEN',
    };

    if (bloodGroup && typeof bloodGroup === 'string' && bloodGroup !== 'ALL') {
      whereClause.bloodGroup = bloodGroup.trim().toUpperCase();
    }

    if (city && typeof city === 'string' && city.trim() !== '') {
      whereClause.city = { contains: city.trim() };
    }

    if (urgency && typeof urgency === 'string' && urgency !== 'ALL') {
      whereClause.urgency = urgency.trim().toUpperCase();
    }

    const requests = await prisma.bloodRequest.findMany({
      where: whereClause,
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            matches: true,
            contactRequests: true,
          },
        },
      },
      orderBy: [{ urgency: 'asc' }, { createdAt: 'desc' }],
    });

    const formatted = requests.map((reqItem) => {
      const remainingMs = Math.max(0, new Date(reqItem.requiredBy).getTime() - Date.now());
      const remainingHours = Math.round((remainingMs / (1000 * 60 * 60)) * 10) / 10;

      return {
        ...reqItem,
        remainingHours,
        isUrgent: reqItem.urgency === 'CRITICAL' || remainingHours < 12,
        // Approximate location jitter for privacy
        approxLatitude: reqItem.latitude ? Math.round(reqItem.latitude * 100) / 100 : null,
        approxLongitude: reqItem.longitude ? Math.round(reqItem.longitude * 100) / 100 : null,
      };
    });

    return res.json({
      success: true,
      total: formatted.length,
      emergencyNotice:
        'CRITICAL NOTICE: LifeLink connects willing volunteers. In life-threatening medical emergencies, immediately contact local emergency services (112 / 108) and licensed regional blood banks.',
      requests: formatted,
    });
  } catch (error) {
    console.error('[ListEmergencyRequests Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to load emergency requests.' });
  }
}

export async function listMyRequests(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const requests = await prisma.bloodRequest.findMany({
      where: { requesterId: req.user.userId },
      include: {
        contactRequests: {
          include: {
            donor: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    phone: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        matches: {
          take: 5,
          orderBy: { score: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, requests });
  } catch (error) {
    console.error('[ListMyRequests Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve requester history.' });
  }
}

export async function sendContactRequestToDonor(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { requestId, donorId, message } = req.body;

    if (!requestId || !donorId) {
      return res.status(400).json({ success: false, error: 'requestId and donorId are required' });
    }

    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
    });

    if (!bloodRequest || bloodRequest.requesterId !== req.user.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized request reference.' });
    }

    const donor = await prisma.donorProfile.findUnique({
      where: { id: donorId },
      include: { user: true },
    });

    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor profile not found.' });
    }

    // Check duplicate pending contact request
    const existing = await prisma.contactRequest.findFirst({
      where: {
        requestId,
        donorId,
        status: 'PENDING',
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A contact request is already pending for this donor.',
      });
    }

    const contact = await prisma.contactRequest.create({
      data: {
        requestId,
        donorId,
        requesterId: req.user.userId,
        message: message || `Urgent blood request for ${bloodRequest.bloodGroup} at ${bloodRequest.hospitalName}`,
        status: 'PENDING',
      },
    });

    // Notify donor
    await sendNotification({
      userId: donor.userId,
      recipientEmail: donor.user.email,
      title: `Direct Contact Request: ${bloodRequest.bloodGroup} Blood Needed`,
      message: `A verified requester sent a contact inquiry regarding a ${bloodRequest.urgency} requirement at ${bloodRequest.hospitalName}.`,
      type: 'MATCH_ALERT',
      data: { requestId, contactRequestId: contact.id },
    });

    return res.status(201).json({
      success: true,
      message: 'Contact outreach sent safely. Donor notified.',
      contactRequest: contact,
    });
  } catch (error) {
    console.error('[SendContactRequest Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to send contact request.' });
  }
}

export async function updateRequestStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status } = req.body; // 'OPEN' | 'MATCHED' | 'FULFILLED' | 'CANCELLED'

    if (!['OPEN', 'MATCHED', 'FULFILLED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status transition.' });
    }

    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id },
    });

    if (!bloodRequest) {
      return res.status(404).json({ success: false, error: 'Request not found.' });
    }

    // Allow requester or admin to change status
    if (bloodRequest.requesterId !== req.user.userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    const updated = await prisma.bloodRequest.update({
      where: { id },
      data: { status },
    });

    await logAuditEvent('REQUEST_STATUS_UPDATED', req.user.userId, { requestId: id, status });

    return res.json({
      success: true,
      message: `Blood request status updated to ${status}.`,
      bloodRequest: updated,
    });
  } catch (error) {
    console.error('[UpdateRequestStatus Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to update request status.' });
  }
}

export async function reportAbuse(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, error: 'targetType, targetId, and reason are required.' });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user.userId,
        targetType,
        targetId,
        reason,
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted for administrator review. Thank you for protecting community safety.',
      reportId: report.id,
    });
  } catch (error) {
    console.error('[ReportAbuse Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to submit report.' });
  }
}
