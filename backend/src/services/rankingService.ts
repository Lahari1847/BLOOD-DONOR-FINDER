// Transparent Explainable AI Donor Ranking Service
// LifeLink – Smart Blood Donor Network

import { checkBloodCompatibility, CompatibilityResult } from './compatibilityService';

export interface LocationCoordinates {
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
}

export interface DonorCandidate {
  id: string;
  bloodGroup: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  isAvailable: boolean;
  lastConfirmedAt: Date;
  reliabilityScore: number; // 0.0 - 1.0
  totalDonations: number;
}

export interface ScoreItem {
  points: number;
  max: number;
  reason: string;
}

export interface RankingExplanation {
  totalScore: number;
  compatibilityType: 'EXACT' | 'COMPATIBLE' | 'INCOMPATIBLE';
  distanceKm: number | null;
  isEligible: boolean;
  breakdown: {
    distance: ScoreItem;
    availability: ScoreItem;
    freshness: ScoreItem;
    reliability: ScoreItem;
  };
  summaryText: string;
  medicalNotice: string;
}

/**
 * Calculates Great-Circle distance using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

/**
 * Calculates transparent, explainable ranking score for donor selection
 */
export function calculateDonorRankingScore(
  recipientBloodGroup: string,
  requestLocation: LocationCoordinates,
  donor: DonorCandidate
): RankingExplanation {
  // 1. Mandatory Eligibility Filter
  const compResult: CompatibilityResult = checkBloodCompatibility(
    recipientBloodGroup,
    donor.bloodGroup
  );

  if (!compResult.isCompatible) {
    return {
      totalScore: 0,
      compatibilityType: 'INCOMPATIBLE',
      distanceKm: null,
      isEligible: false,
      breakdown: {
        distance: { points: 0, max: 40, reason: 'Ineligible blood group antibodies' },
        availability: { points: 0, max: 25, reason: 'Ineligible' },
        freshness: { points: 0, max: 20, reason: 'Ineligible' },
        reliability: { points: 0, max: 15, reason: 'Ineligible' },
      },
      summaryText: `Incompatible: ${donor.bloodGroup} red blood cells cannot be safely received by ${recipientBloodGroup}.`,
      medicalNotice: compResult.medicalDisclaimer,
    };
  }

  // 2. Distance Component (0 - 40 pts)
  let distanceKm: number | null = null;
  let distancePoints = 0;
  let distanceReason = '';

  if (
    requestLocation.latitude != null &&
    requestLocation.longitude != null &&
    donor.latitude != null &&
    donor.longitude != null
  ) {
    distanceKm = calculateHaversineDistance(
      requestLocation.latitude,
      requestLocation.longitude,
      donor.latitude,
      donor.longitude
    );

    if (distanceKm <= 5) {
      distancePoints = 40;
      distanceReason = `Immediate radius (${distanceKm} km away) - highest transit priority`;
    } else if (distanceKm <= 15) {
      distancePoints = 32;
      distanceReason = `Close proximity (${distanceKm} km away)`;
    } else if (distanceKm <= 30) {
      distancePoints = 24;
      distanceReason = `Moderate transit distance (${distanceKm} km away)`;
    } else if (distanceKm <= 50) {
      distancePoints = 16;
      distanceReason = `Within regional metro boundary (${distanceKm} km away)`;
    } else if (distanceKm <= 100) {
      distancePoints = 8;
      distanceReason = `Inter-city transit range (${distanceKm} km away)`;
    } else {
      distancePoints = 3;
      distanceReason = `Long distance (${distanceKm} km away)`;
    }
  } else {
    // City name fallback if coordinates omitted
    const sameCity =
      requestLocation.city &&
      donor.city &&
      requestLocation.city.trim().toLowerCase() === donor.city.trim().toLowerCase();

    if (sameCity) {
      distancePoints = 25;
      distanceReason = `Identical city match (${donor.city}) without exact GPS coordinates`;
    } else {
      distancePoints = 5;
      distanceReason = `Different city (${donor.city} vs ${requestLocation.city || 'unspecified'})`;
    }
  }

  // 3. Availability Component (0 - 25 pts)
  let availabilityPoints = 0;
  let availabilityReason = '';
  if (donor.isAvailable) {
    availabilityPoints = 25;
    availabilityReason = 'Donor currently marked as Available and ready for outreach';
  } else {
    availabilityPoints = 0;
    availabilityReason = 'Donor temporarily marked as Unavailable or recovering';
  }

  // 4. Freshness Component (0 - 20 pts)
  const now = new Date().getTime();
  const confirmedTime = new Date(donor.lastConfirmedAt).getTime();
  const diffHours = Math.max(0, (now - confirmedTime) / (1000 * 60 * 60));
  const diffDays = diffHours / 24;

  let freshnessPoints = 0;
  let freshnessReason = '';

  if (diffHours <= 24) {
    freshnessPoints = 20;
    freshnessReason = 'Profile availability confirmed within the last 24 hours';
  } else if (diffDays <= 7) {
    freshnessPoints = 17;
    freshnessReason = `Profile verified recently (${Math.round(diffDays)} days ago)`;
  } else if (diffDays <= 14) {
    freshnessPoints = 13;
    freshnessReason = `Profile verified ${Math.round(diffDays)} days ago`;
  } else if (diffDays <= 30) {
    freshnessPoints = 9;
    freshnessReason = 'Profile confirmed in the past month';
  } else if (diffDays <= 90) {
    freshnessPoints = 5;
    freshnessReason = 'Profile confirmation over 30 days old';
  } else {
    freshnessPoints = 2;
    freshnessReason = 'Unconfirmed profile (>90 days since last status update)';
  }

  // 5. Reliability & History Component (0 - 15 pts)
  const cleanReliability = Math.max(0, Math.min(1, donor.reliabilityScore || 1.0));
  const reliabilityPoints = Math.round(cleanReliability * 15 * 10) / 10;
  const reliabilityPercent = Math.round(cleanReliability * 100);
  const reliabilityReason = `${reliabilityPercent}% historical response rate (${donor.totalDonations} lifetime donations recorded)`;

  const totalScore = Math.round(
    (distancePoints + availabilityPoints + freshnessPoints + reliabilityPoints) * 10
  ) / 10;

  const matchLabel = compResult.matchType === 'EXACT' ? 'Exact match' : 'Compatible match';
  const summaryText = `${matchLabel} (${donor.bloodGroup}) with ${totalScore}/100 priority score. Distance: ${
    distanceKm != null ? `${distanceKm} km` : donor.city
  }.`;

  return {
    totalScore,
    compatibilityType: compResult.matchType,
    distanceKm,
    isEligible: true,
    breakdown: {
      distance: { points: distancePoints, max: 40, reason: distanceReason },
      availability: { points: availabilityPoints, max: 25, reason: availabilityReason },
      freshness: { points: freshnessPoints, max: 20, reason: freshnessReason },
      reliability: { points: reliabilityPoints, max: 15, reason: reliabilityReason },
    },
    summaryText,
    medicalNotice: compResult.medicalDisclaimer,
  };
}
