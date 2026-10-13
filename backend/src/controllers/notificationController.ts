// Notifications Management Controller
// LifeLink – Smart Blood Donor Network

import { Response } from 'express';
import { prisma } from '../db/client';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.userId,
        isRead: false,
      },
    });

    return res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('[GetNotifications Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve notifications.' });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== req.user.userId) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('[MarkAsRead Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to update notification.' });
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    await prisma.notification.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true },
    });

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('[MarkAllAsRead Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to mark notifications.' });
  }
}
