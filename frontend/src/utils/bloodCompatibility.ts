// Blood Compatibility Rules & Metadata for All 8 Blood Groups
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const ALL_BLOOD_GROUPS: BloodGroup[] = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export interface BloodGroupInfo {
  group: BloodGroup;
  canGiveTo: BloodGroup[];
  canReceiveFrom: BloodGroup[];
  description: string;
  isUniversalDonor?: boolean;
  isUniversalRecipient?: boolean;
  rarityInIndia: string;
}

export const BLOOD_GROUP_DETAILS: Record<BloodGroup, BloodGroupInfo> = {
  'O-': {
    group: 'O-',
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    description: 'Universal Red Cell Donor. Essential in trauma care when patient type is unknown.',
    isUniversalDonor: true,
    rarityInIndia: 'Rare (~1.5%)',
  },
  'O+': {
    group: 'O+',
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    description: 'Most common blood group in India. High demand across all surgical wards.',
    rarityInIndia: 'Very Common (~38%)',
  },
  'A+': {
    group: 'A+',
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    description: 'Second most common group. Can safely receive from all A and O groups.',
    rarityInIndia: 'Common (~22%)',
  },
  'A-': {
    group: 'A-',
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
    description: 'Rh-negative type. Can receive only from A- and O-.',
    rarityInIndia: 'Rare (~0.8%)',
  },
  'B+': {
    group: 'B+',
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    description: 'Widely prevalent in Indian subcontinent. Can donate to B+ and AB+.',
    rarityInIndia: 'Very Common (~32%)',
  },
  'B-': {
    group: 'B-',
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
    description: 'Rare Rh-negative group. High emergency priority during accidents.',
    rarityInIndia: 'Rare (~1.4%)',
  },
  'AB+': {
    group: 'AB+',
    canGiveTo: ['AB+'],
    canReceiveFrom: ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    description: 'Universal Recipient for red blood cells. Can receive all compatible groups.',
    isUniversalRecipient: true,
    rarityInIndia: 'Uncommon (~8%)',
  },
  'AB-': {
    group: 'AB-',
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    description: 'Rarest blood group in India. Needs proactive volunteer network coordination.',
    rarityInIndia: 'Extremely Rare (~0.4%)',
  },
};
