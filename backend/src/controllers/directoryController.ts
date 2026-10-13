// Hospitals & Blood Banks Directory Controller
// LifeLink – Smart Blood Donor Network

import { Request, Response } from 'express';
import { prisma } from '../db/client';

export async function listHospitals(req: Request, res: Response) {
  try {
    const { city } = req.query;

    const whereClause: any = {};
    if (city && typeof city === 'string' && city.trim() !== '') {
      whereClause.city = { contains: city.trim() };
    }

    const hospitals = await prisma.hospital.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    const parsed = hospitals.map((h) => ({
      ...h,
      bloodStock: h.bloodStockJson ? JSON.parse(h.bloodStockJson) : null,
    }));

    return res.json({ success: true, hospitals: parsed });
  } catch (error) {
    console.error('[ListHospitals Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve hospitals directory.' });
  }
}

export async function listBloodBanks(req: Request, res: Response) {
  try {
    const { city } = req.query;

    const whereClause: any = {};
    if (city && typeof city === 'string' && city.trim() !== '') {
      whereClause.city = { contains: city.trim() };
    }

    const bloodBanks = await prisma.bloodBank.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    const parsed = bloodBanks.map((b) => ({
      ...b,
      bloodStock: b.bloodStockJson ? JSON.parse(b.bloodStockJson) : null,
    }));

    return res.json({ success: true, bloodBanks: parsed });
  } catch (error) {
    console.error('[ListBloodBanks Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve blood banks directory.' });
  }
}

export async function getPublicStats(req: Request, res: Response) {
  try {
    const totalDonors = await prisma.donorProfile.count();
    const activeRequests = await prisma.bloodRequest.count({
      where: { status: 'OPEN' },
    });
    const resolvedRequests = await prisma.bloodRequest.count({
      where: { status: 'FULFILLED' },
    });
    const totalHospitals = await prisma.hospital.count();
    const totalBloodBanks = await prisma.bloodBank.count();

    const donorsByGroup = await prisma.donorProfile.groupBy({
      by: ['bloodGroup'],
      _count: { _all: true },
    });

    const bloodGroupDistribution: Record<string, number> = {};
    donorsByGroup.forEach((d) => {
      bloodGroupDistribution[d.bloodGroup] = d._count._all;
    });

    return res.json({
      success: true,
      stats: {
        totalDonors,
        activeRequests,
        resolvedRequests,
        totalHospitals: totalHospitals + totalBloodBanks,
        bloodGroupDistribution,
      },
    });
  } catch (error) {
    console.error('[PublicStats Error]', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve public statistics.' });
  }
}

