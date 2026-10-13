// Audit Logging Service for Security & Compliance
// LifeLink – Smart Blood Donor Network

import { prisma } from '../db/client';

export async function logAuditEvent(
  action: string,
  userId?: string | null,
  details?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        detailsJson: details ? JSON.stringify(details) : null,
      },
    });
  } catch (error) {
    console.error('[LifeLink Audit] Failed to record audit log:', error);
  }
}
