import { Model } from 'mongoose';
export type AddOnStatus = 'live' | 'coming_soon' | 'archived';
export type VenueTier = 'tier_1' | 'tier_1_plus' | 'tier_2' | 'tier_3' | 'tier_3_plus';
export type AddOnAvailability = 'all' | VenueTier[];


export type CapabilityKey =
  | 'sponsored_listings'
  | 'push_notifications'
  | 'advanced_data_export';

export interface IAddon {
  label: string;
  short: string;
  description: string;
  bullets: string[];
  priceMonthly: number;
  color: string;
  /** Lucide icon name — resolved in UI via a string→component map. */
  icon: string;
  /** If set, purchasing this add-on grants access to this tier module. */
  linkedModule?: number;
  /** Stable feature identifier — used by feature-gating code. */
  capabilityKey: CapabilityKey;
  status: AddOnStatus;
  /** Which tiers this add-on can be purchased on. 'all' = available everywhere. */
  availableOn: AddOnAvailability;
}

export type AddonModel = Model<IAddon>;
