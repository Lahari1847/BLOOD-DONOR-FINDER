// Donor Profile & Search Controller
// LifeLink – Smart Blood Donor Network

import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db/client';
import { AuthenticatedRequest } from '../middleware/auth';
import { calculateDonorRankingScore } from '../services/rankingService';
import { ALL_BLOOD_GROUPS, getCompatibleDonorGroups } from '../services/compatibilityService';
import { sendNotification } from '../services/notificationService';
import { logAuditEvent } from '../services/auditService';

const donorProfileSchema = z.object({
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  city: z.string().min(2, 'City is required'),
  locality: z.string().optional(),
  pincode: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  age: z.number().min(18, 'Donors must be at least 18 years old to register').max(65, 'Donors must be under 65 years old'),
  lastDonationDate: z.string().optional().nullable(),
  isAvailable: z.boolean().default(true),
  preferredContact: z.enum(['IN_APP', 'EMAIL', 'PHONE']).default('IN_APP'),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'Consent to donate blood network guidelines is required',
  }),
  isPublic: z.boolean().default(true),
});

export async function upsertDonorProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const parseResult = donorProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors.map((e) => e.message).join(', '),
      });
    }

    const data = parseResult.data;

    const profile = await prisma.donorProfile.upsert({
      where: { userId: req.user.userId },
      create: {
        userId: req.user.userId,
        bloodGroup: data.bloodGroup,
        city: data.city,
        locality: data.locality || null,
        pincode: data.pincode || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        age: data.age,
        lastDonationDate: data.lastDonationDate ? new Date(data.lastDonationDate) : null,
        isAvailable: data.isAvailable,
        lastConfirmedAt: new Date(),
        preferredContact: data.preferredContact,
        consentGiven: data.consentGiven,
        isPublic: data.isPublic,
      },
      update: {
        bloodGroup: data.bloodGroup,
        city: data.city,
        locality: data.locality || null,
        pincode: data.pincode || null,
        latitude: data.latitude !== undefined ? data.latitude : undefined,
        longitude: data.longitude !== undefined ? data.longitude : undefined,
        age: data.age,
        lastDonationDate: data.lastDonationDate ? new Date(data.lastDonationDate) : undefined,
        isAvailable: data.isAvailable,
        lastConfirmedAt: new Date(),
        preferredContact: data.preferredContact,
        isPublic: data.isPublic,
      },
    });

    await logAuditEvent('DONOR_PROFILE_UPSERT', req.user.userId, { bloodGroup: data.bloodGroup });

    return res.json({
      success: true,
      message: 'Donor profile saved successfully.',
      profile,
    });
  } catch (error) {
    console.error('[UpsertDonorProfile Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to save donor profile.' });
  }
}

export async function toggleAvailability(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const currentProfile = await prisma.donorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!currentProfile) {
      return res.status(404).json({ success: false, error: 'Donor profile not found. Register as donor first.' });
    }

    const newStatus = !currentProfile.isAvailable;
    const updated = await prisma.donorProfile.update({
      where: { userId: req.user.userId },
      data: {
        isAvailable: newStatus,
        lastConfirmedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      message: `Availability updated to ${newStatus ? 'Available' : 'Unavailable'}. Timestamp refreshed.`,
      isAvailable: updated.isAvailable,
      lastConfirmedAt: updated.lastConfirmedAt,
    });
  } catch (error) {
    console.error('[ToggleAvailability Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to toggle availability.' });
  }
}

export async function searchDonors(req: Request, res: Response) {
  try {
    const {
      bloodGroup,
      city,
      pincode,
      latitude,
      longitude,
      radius,
      onlyAvailable = 'true',
      sortBy = 'score', // 'score' | 'distance' | 'freshness'
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));

    // Determine compatible donor groups if a patient bloodGroup is given
    let allowedDonorGroups: string[] = ALL_BLOOD_GROUPS;
    const allGroupsSearch = !bloodGroup || bloodGroup === 'ALL';
    if (bloodGroup && typeof bloodGroup === 'string' && !allGroupsSearch) {
      const targetGroup = bloodGroup.trim().toUpperCase();
      allowedDonorGroups = getCompatibleDonorGroups(targetGroup);
      if (allowedDonorGroups.length === 0) {
        allowedDonorGroups = [targetGroup];
      }
    }

    // Build database filters
    const whereClause: any = {
      isPublic: true,
      consentGiven: true,
      bloodGroup: { in: allowedDonorGroups },
    };

    if (onlyAvailable === 'true') {
      whereClause.isAvailable = true;
    }

    if (city && typeof city === 'string' && city.trim() !== '') {
      whereClause.city = { contains: city.trim() };
    }

    if (pincode && typeof pincode === 'string' && pincode.trim() !== '') {
      whereClause.pincode = pincode.trim();
    }

    const donors = await prisma.donorProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    });

    const reqLat = latitude ? parseFloat(latitude as string) : null;
    const reqLng = longitude ? parseFloat(longitude as string) : null;
    // Calculate transparent AI ranking for each donor candidate
    const scoredDonors = donors.map((donor) => {
      const candidate = {
        id: donor.id,
        bloodGroup: donor.bloodGroup,
        city: donor.city,
        latitude: donor.latitude,
        longitude: donor.longitude,
        isAvailable: donor.isAvailable,
        lastConfirmedAt: donor.lastConfirmedAt,
        reliabilityScore: donor.reliabilityScore,
        totalDonations: donor.totalDonations,
      };

      const ranking = calculateDonorRankingScore(
        allGroupsSearch ? donor.bloodGroup : (bloodGroup as string),
        {
          latitude: reqLat,
          longitude: reqLng,
          city: (city as string) || null,
        },
        candidate
      );

      const explanationSummary = allGroupsSearch
        ? `Compatibility not assessed. Priority score: ${ranking.totalScore}/100; select a patient blood group to filter for clinically compatible donors.`
        : ranking.summaryText;

      // Mask sensitive personal information:
      // Show first name + initial, mask phone & exact address
      const publicName = donor.user.fullName
        .trim()
        .replace(/^\[DEMO\]\s*/i, '')
        .replace(/\s+\([^)]*\)\s*$/, '')
        .trim();
      const nameParts = publicName.split(/\s+/).filter(Boolean);
      const displayName = nameParts.length > 1
        ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
        : nameParts[0] || 'Donor';

      return {
        id: donor.id,
        userId: donor.userId,
        displayName,
        bloodGroup: donor.bloodGroup,
        city: donor.city,
        locality: donor.locality,
        approximateDistanceKm: ranking.distanceKm,
        isAvailable: donor.isAvailable,
        lastConfirmedAt: donor.lastConfirmedAt,
        lastDonationDate: donor.lastDonationDate,
        totalDonations: donor.totalDonations,
        isVerified: donor.user.isVerified,
        preferredContact: donor.preferredContact,
        rankingScore: ranking.totalScore,
        compatibilityType: allGroupsSearch ? 'UNASSESSED' : ranking.compatibilityType,
        rankingExplanation: ranking.breakdown,
        explanationSummary,
        medicalNotice: ranking.medicalNotice,
        // Approximate coordinates (jittered for privacy if exposed)
        approxLatitude: donor.latitude ? Math.round(donor.latitude * 100) / 100 : null,
        approxLongitude: donor.longitude ? Math.round(donor.longitude * 100) / 100 : null,
      };
    });

    // Sort candidates
    scoredDonors.sort((a, b) => {
      if (sortBy === 'distance') {
        if (a.approximateDistanceKm == null) return 1;
        if (b.approximateDistanceKm == null) return -1;
        return a.approximateDistanceKm - b.approximateDistanceKm;
      }
      if (sortBy === 'freshness') {
        return new Date(b.lastConfirmedAt).getTime() - new Date(a.lastConfirmedAt).getTime();
      }
      // Default: sort by AI ranking score
      return b.rankingScore - a.rankingScore;
    });

    // Filter by radius if provided
    let filtered = scoredDonors;
    if (radius && typeof radius === 'string') {
      const radiusKm = parseFloat(radius);
      if (!isNaN(radiusKm)) {
        filtered = filtered.filter(
          (d) => d.approximateDistanceKm !== null && d.approximateDistanceKm <= radiusKm
        );
      }
    }

    const total = filtered.length;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    return res.json({
      success: true,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        searchedBloodGroup: allGroupsSearch ? null : bloodGroup,
        compatibleGroups: allowedDonorGroups,
      },
      donors: paginated,
    });
  } catch (error) {
    console.error('[SearchDonors Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to search donors.' });
  }
}

export async function addDonationRecord(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { donationDate, donationType = 'WHOLE_BLOOD', units = 1, hospitalName, notes } = req.body;

    const donorProfile = await prisma.donorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!donorProfile) {
      return res.status(404).json({ success: false, error: 'Donor profile required.' });
    }

    const dDate = donationDate ? new Date(donationDate) : new Date();

    // Standard clinical recovery intervals:
    // Whole blood: 90 days (12 weeks)
    // Platelets: 14 days
    // Plasma: 28 days
    // Double red cells: 112 days
    let intervalDays = 90;
    if (donationType === 'PLATELETS') intervalDays = 14;
    else if (donationType === 'PLASMA') intervalDays = 28;
    else if (donationType === 'RED_CELLS') intervalDays = 112;

    const nextEligibleDate = new Date(dDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    const record = await prisma.donationRecord.create({
      data: {
        donorId: donorProfile.id,
        donationDate: dDate,
        donationType,
        units: parseInt(units, 10) || 1,
        hospitalName: hospitalName || 'LifeLink Certified Blood Bank',
        notes: notes || null,
        verified: true,
        nextEligibleDate,
      },
    });

    // Update profile stats and temporarily mark unavailable if donation was today
    await prisma.donorProfile.update({
      where: { id: donorProfile.id },
      data: {
        totalDonations: { increment: 1 },
        lastDonationDate: dDate,
        isAvailable: false, // In recovery period
        lastConfirmedAt: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Donation record added. Next eligible donation date calculated.',
      record,
      nextEligibleDate,
      intervalDays,
    });
  } catch (error) {
    console.error('[AddDonationRecord Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to add donation record.' });
  }
}

export async function getDonorContactRequests(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const profile = await prisma.donorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      return res.json({ success: true, contactRequests: [] });
    }

    const requests = await prisma.contactRequest.findMany({
      where: { donorId: profile.id },
      include: {
        bloodRequest: true,
        requester: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, contactRequests: requests });
  } catch (error) {
    console.error('[GetDonorContactRequests Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to load contact requests.' });
  }
}

export async function getDonorAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const profile = await prisma.donorProfile.findUnique({
      where: { userId: req.user.userId },
      select: { id: true, totalDonations: true },
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Donor profile not found.' });
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setUTCDate(1);
    sixMonthsAgo.setUTCHours(0, 0, 0, 0);
    sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 5);

    const [donationTotals, recentDonations, requestStatuses] = await Promise.all([
      prisma.donationRecord.aggregate({
        where: { donorId: profile.id },
        _sum: { units: true },
      }),
      prisma.donationRecord.findMany({
        where: {
          donorId: profile.id,
          donationDate: { gte: sixMonthsAgo },
        },
        select: { donationDate: true },
      }),
      prisma.contactRequest.groupBy({
        by: ['status'],
        where: { donorId: profile.id },
        _count: { _all: true },
      }),
    ]);

    const monthlyDonations = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(sixMonthsAgo);
      date.setUTCMonth(date.getUTCMonth() + index);
      return {
        month: date.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' }),
        year: date.getUTCFullYear(),
        count: 0,
      };
    });

    for (const donation of recentDonations) {
      const donationDate = new Date(donation.donationDate);
      const monthIndex = monthlyDonations.findIndex(
        (month) => month.year === donationDate.getUTCFullYear()
          && month.month === donationDate.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' })
      );
      if (monthIndex >= 0) monthlyDonations[monthIndex].count += 1;
    }

    const statusCounts = Object.fromEntries(
      requestStatuses.map(({ status, _count }) => [status, _count._all])
    ) as Record<string, number>;
    const totalInquiries = Object.values(statusCounts).reduce((total, count) => total + count, 0);
    const pendingInquiries = statusCounts.PENDING || 0;
    const respondedInquiries = totalInquiries - pendingInquiries;

    return res.json({
      success: true,
      analytics: {
        totalDonations: profile.totalDonations,
        unitsDonated: donationTotals._sum.units || 0,
        totalInquiries,
        pendingInquiries,
        respondedInquiries,
        responseRate: totalInquiries === 0 ? 0 : Math.round((respondedInquiries / totalInquiries) * 100),
        monthlyDonations,
      },
    });
  } catch (error) {
    console.error('[GetDonorAnalytics Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to load donor analytics.' });
  }
}

export async function respondToContactRequest(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { action } = req.body; // 'ACCEPT' | 'DECLINE' | 'RESERVE'

    if (!['ACCEPT', 'DECLINE', 'RESERVE'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action.' });
    }

    const profile = await prisma.donorProfile.findUnique({
      where: { userId: req.user.userId },
    });

    if (!profile) {
      return res.status(404).json({ success: false, error: 'Donor profile not found.' });
    }

    const contactReq = await prisma.contactRequest.findUnique({
      where: { id },
      include: { bloodRequest: true },
    });

    if (!contactReq || contactReq.donorId !== profile.id) {
      return res.status(404).json({ success: false, error: 'Contact request not found.' });
    }

    const newStatus = action === 'ACCEPT' ? 'ACCEPTED' : action === 'RESERVE' ? 'RESERVED' : 'DECLINED';

    const updated = await prisma.contactRequest.update({
      where: { id },
      data: {
        status: newStatus,
        respondedAt: new Date(),
      },
    });

    // Notify requester
    await sendNotification({
      userId: contactReq.requesterId,
      title: `Donor ${action === 'ACCEPT' ? 'Accepted' : action === 'RESERVE' ? 'Reserved' : 'Declined'} Contact Request`,
      message: `A donor has ${action.toLowerCase()}ed your request for patient ${contactReq.bloodRequest.patientName} (${contactReq.bloodRequest.bloodGroup}).`,
      type: 'STATUS_UPDATE',
      data: { requestId: contactReq.requestId, donorId: profile.id },
    });

    return res.json({
      success: true,
      message: `Request status changed to ${newStatus}.`,
      contactRequest: updated,
    });
  } catch (error) {
    console.error('[RespondToContactRequest Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to respond to request.' });
  }
}
