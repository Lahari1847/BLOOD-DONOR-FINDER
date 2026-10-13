import { describe, it, expect } from 'vitest';
import {
  calculateHaversineDistance,
  calculateDonorRankingScore,
  DonorCandidate,
} from '../src/services/rankingService';

describe('Transparent AI Donor Ranking Service', () => {
  it('accurately calculates Haversine distance between coordinates', () => {
    // Indiranagar (12.9784, 77.6408) to Koramangala (12.9352, 77.6245) is ~5.1 km
    const dist = calculateHaversineDistance(12.9784, 77.6408, 12.9352, 77.6245);
    expect(dist).toBeGreaterThan(4);
    expect(dist).toBeLessThan(6.5);
  });

  it('assigns 0 points to incompatible blood donors', () => {
    const candidate: DonorCandidate = {
      id: 'd1',
      bloodGroup: 'B+',
      city: 'Bengaluru',
      latitude: 12.97,
      longitude: 77.64,
      isAvailable: true,
      lastConfirmedAt: new Date(),
      reliabilityScore: 1.0,
      totalDonations: 5,
    };

    // Patient requires O-
    const result = calculateDonorRankingScore('O-', { latitude: 12.97, longitude: 77.64 }, candidate);
    expect(result.isEligible).toBe(false);
    expect(result.totalScore).toBe(0);
    expect(result.compatibilityType).toBe('INCOMPATIBLE');
  });

  it('assigns high transparent score to nearby available confirmed donor', () => {
    const candidate: DonorCandidate = {
      id: 'd2',
      bloodGroup: 'O-',
      city: 'Bengaluru',
      latitude: 12.971,
      longitude: 77.641,
      isAvailable: true,
      lastConfirmedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      reliabilityScore: 1.0,
      totalDonations: 8,
    };

    const result = calculateDonorRankingScore(
      'O-',
      { latitude: 12.97, longitude: 77.64, city: 'Bengaluru' },
      candidate
    );

    expect(result.isEligible).toBe(true);
    expect(result.compatibilityType).toBe('EXACT');
    expect(result.totalScore).toBeGreaterThanOrEqual(95);

    // Verify component breakdowns
    expect(result.breakdown.distance.points).toBe(40);
    expect(result.breakdown.availability.points).toBe(25);
    expect(result.breakdown.freshness.points).toBe(20);
    expect(result.breakdown.reliability.points).toBe(15);
  });

  it('penalizes unavailable donors in scoring breakdown', () => {
    const candidate: DonorCandidate = {
      id: 'd3',
      bloodGroup: 'A+',
      city: 'Bengaluru',
      latitude: 12.97,
      longitude: 77.64,
      isAvailable: false, // In recovery
      lastConfirmedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      reliabilityScore: 0.8,
      totalDonations: 1,
    };

    const result = calculateDonorRankingScore(
      'A+',
      { latitude: 12.97, longitude: 77.64 },
      candidate
    );

    expect(result.isEligible).toBe(true);
    expect(result.breakdown.availability.points).toBe(0);
    expect(result.totalScore).toBeLessThan(70);
  });
});
