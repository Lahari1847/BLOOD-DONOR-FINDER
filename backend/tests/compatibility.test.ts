import { describe, it, expect } from 'vitest';
import {
  checkBloodCompatibility,
  getCompatibleDonorGroups,
  ALL_BLOOD_GROUPS,
} from '../src/services/compatibilityService';

describe('ABO/Rh Blood Compatibility Matrix', () => {
  it('should recognize all 8 valid blood groups', () => {
    expect(ALL_BLOOD_GROUPS).toHaveLength(8);
    expect(ALL_BLOOD_GROUPS).toEqual(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
  });

  it('should identify identical groups as EXACT matches', () => {
    ALL_BLOOD_GROUPS.forEach((group) => {
      const res = checkBloodCompatibility(group, group);
      expect(res.isCompatible).toBe(true);
      expect(res.matchType).toBe('EXACT');
    });
  });

  it('Universal Donor (O-) can safely donate red blood cells to all 8 groups', () => {
    ALL_BLOOD_GROUPS.forEach((group) => {
      const res = checkBloodCompatibility(group, 'O-');
      expect(res.isCompatible).toBe(true);
    });
  });

  it('Universal Recipient (AB+) can receive from all 8 groups', () => {
    const donors = getCompatibleDonorGroups('AB+');
    expect(donors).toHaveLength(8);
    expect(donors).toEqual(expect.arrayContaining(ALL_BLOOD_GROUPS));
  });

  it('O- recipient can ONLY receive from O-', () => {
    const compatible = getCompatibleDonorGroups('O-');
    expect(compatible).toEqual(['O-']);

    const incompatibleGroups = ['O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    incompatibleGroups.forEach((bg) => {
      const res = checkBloodCompatibility('O-', bg);
      expect(res.isCompatible).toBe(false);
      expect(res.matchType).toBe('INCOMPATIBLE');
    });
  });

  it('A+ recipient can receive from A+, A-, O+, O-', () => {
    const compatible = getCompatibleDonorGroups('A+');
    expect(compatible).toEqual(['A+', 'A-', 'O+', 'O-']);

    expect(checkBloodCompatibility('A+', 'B+').isCompatible).toBe(false);
    expect(checkBloodCompatibility('A+', 'AB+').isCompatible).toBe(false);
  });

  it('Always provides mandatory clinical medical disclaimer', () => {
    const res = checkBloodCompatibility('A+', 'O-');
    expect(res.medicalDisclaimer).toContain('MEDICAL NOTICE');
    expect(res.medicalDisclaimer).toContain('cross-matching');
  });
});
