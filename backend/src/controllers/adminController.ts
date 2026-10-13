// Admin Analytics & Moderation Controller (Real DB Counts)
// LifeLink – Smart Blood Donor Network

import { Response } from 'express';
import { prisma } from '../db/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { ALL_BLOOD_GROUPS } from '../services/compatibilityService';

export async function getAdminAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    // 1. Registered Donors Count
    const totalDonors = await prisma.donorProfile.count();
    const availableDonors = await prisma.donorProfile.count({
      where: { isAvailable: true },
    });

    // 2. Requests Counts
    const totalRequests = await prisma.bloodRequest.count();
    const activeRequests = await prisma.bloodRequest.count({
      where: { status: 'OPEN' },
    });
    const fulfilledRequests = await prisma.bloodRequest.count({
      where: { status: 'FULFILLED' },
    });
    const criticalRequests = await prisma.bloodRequest.count({
      where: { status: 'OPEN', urgency: 'CRITICAL' },
    });

    // 3. Blood Group Distribution (Actual DB records)
    const donorsByGroupRaw = await prisma.donorProfile.groupBy({
      by: ['bloodGroup'],
      _count: {
        _all: true,
      },
    });

    const bloodGroupDistribution: Record<string, number> = {};
    ALL_BLOOD_GROUPS.forEach((bg) => {
      bloodGroupDistribution[bg] = 0;
    });
    donorsByGroupRaw.forEach((item) => {
      bloodGroupDistribution[item.bloodGroup] = item._count._all;
    });

    // 4. Partner Institutions Count
    const totalHospitals = await prisma.hospital.count();
    const totalBloodBanks = await prisma.bloodBank.count();

    // 5. Contact Requests & Response Rates
    const totalContactOutreaches = await prisma.contactRequest.count();
    const acceptedOutreaches = await prisma.contactRequest.count({
      where: { status: { in: ['ACCEPTED', 'RESERVED'] } },
    });

    // 6. Recent Audit Activity
    const recentAuditLogs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 7. Pending Reports
    const pendingReportsCount = await prisma.report.count({
      where: { status: 'PENDING' },
    });

    return res.json({
      success: true,
      analytics: {
        totalDonors,
        availableDonors,
        totalRequests,
        activeRequests,
        fulfilledRequests,
        criticalRequests,
        resolutionRate:
          totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0,
        bloodGroupDistribution,
        totalHospitals,
        totalBloodBanks,
        totalContactOutreaches,
        acceptedOutreaches,
        acceptanceRate:
          totalContactOutreaches > 0
            ? Math.round((acceptedOutreaches / totalContactOutreaches) * 100)
            : 0,
        pendingReportsCount,
      },
      recentAuditLogs,
    });
  } catch (error) {
    console.error('[GetAdminAnalytics Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to compute admin analytics.' });
  }
}

export async function listReports(req: AuthenticatedRequest, res: Response) {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, reports });
  } catch (error) {
    console.error('[ListReports Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve reports.' });
  }
}

export async function updateReportStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'REVIEWED' | 'DISMISSED'

    if (!['REVIEWED', 'DISMISSED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid report status.' });
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, message: `Report marked as ${status}.`, report });
  } catch (error) {
    console.error('[UpdateReportStatus Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to update report status.' });
  }
}

export async function togglePartnerVerification(req: AuthenticatedRequest, res: Response) {
  try {
    const { type, id } = req.params; // type: 'hospital' | 'bloodbank'

    if (type === 'hospital') {
      const hospital = await prisma.hospital.findUnique({ where: { id } });
      if (!hospital) return res.status(404).json({ success: false, error: 'Hospital not found' });

      const updated = await prisma.hospital.update({
        where: { id },
        data: { isVerified: !hospital.isVerified },
      });
      return res.json({ success: true, partner: updated });
    } else if (type === 'bloodbank') {
      const bloodBank = await prisma.bloodBank.findUnique({ where: { id } });
      if (!bloodBank) return res.status(404).json({ success: false, error: 'Blood bank not found' });

      const updated = await prisma.bloodBank.update({
        where: { id },
        data: { isVerified: !bloodBank.isVerified },
      });
      return res.json({ success: true, partner: updated });
    }

    return res.status(400).json({ success: false, error: 'Invalid partner type.' });
  } catch (error) {
    console.error('[TogglePartnerVerification Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to toggle partner verification.' });
  }
}
