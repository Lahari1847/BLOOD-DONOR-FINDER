// Blood Compatibility Matrix & Medical Rules for ABO/Rh System
// LifeLink – Smart Blood Donor Network

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const ALL_BLOOD_GROUPS: BloodGroup[] = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

// Red Blood Cell (RBC) Compatibility Matrix
// Key = Recipient Blood Group, Value = Array of Compatible Donor Blood Groups
export const RBC_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

// Which recipients can a given donor donate to?
// Key = Donor Blood Group, Value = Array of Eligible Recipient Blood Groups
export const DONOR_CAN_GIVE_TO_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // Can only give to AB+
};

export interface CompatibilityResult {
  isCompatible: boolean;
  matchType: 'EXACT' | 'COMPATIBLE' | 'INCOMPATIBLE';
  description: string;
  medicalDisclaimer: string;
}

export function checkBloodCompatibility(
  recipientGroup: string,
  donorGroup: string
): CompatibilityResult {
  const normRecipient = recipientGroup.trim().toUpperCase() as BloodGroup;
  const normDonor = donorGroup.trim().toUpperCase() as BloodGroup;

  const medicalDisclaimer =
    'MEDICAL NOTICE: The LifeLink match score and compatibility categorization are algorithmic contact aids. Final transfusion decisions require strict laboratory pre-transfusion cross-matching and serological verification by licensed healthcare personnel.';

  if (!ALL_BLOOD_GROUPS.includes(normRecipient) || !ALL_BLOOD_GROUPS.includes(normDonor)) {
    return {
      isCompatible: false,
      matchType: 'INCOMPATIBLE',
      description: 'Invalid blood group specified.',
      medicalDisclaimer,
    };
  }

  if (normRecipient === normDonor) {
    return {
      isCompatible: true,
      matchType: 'EXACT',
      description: `Exact blood group match (${normDonor} to ${normRecipient}). Preferred standard match.`,
      medicalDisclaimer,
    };
  }

  const compatibleDonors = RBC_COMPATIBILITY_MAP[normRecipient] || [];
  if (compatibleDonors.includes(normDonor)) {
    return {
      isCompatible: true,
      matchType: 'COMPATIBLE',
      description: `Compatible secondary match (${normDonor} donor can safely donate red blood cells to ${normRecipient} recipient).`,
      medicalDisclaimer,
    };
  }

  return {
    isCompatible: false,
    matchType: 'INCOMPATIBLE',
    description: `Incompatible match (${normDonor} red cells are not compatible with ${normRecipient} recipient antibodies).`,
    medicalDisclaimer,
  };
}

export function getCompatibleDonorGroups(recipientGroup: string): BloodGroup[] {
  const normRecipient = recipientGroup.trim().toUpperCase() as BloodGroup;
  return RBC_COMPATIBILITY_MAP[normRecipient] || [];
}
