import { Model } from 'mongoose';

export type IPackage = {
  priceId?: string;
  payment_link?: string;
  product?: string;
  label: string;
  short: string;
  status: 'active' | 'delete';
  audience: string;
  modules: number[];
  can_charge: boolean;
  description: string;
  color: string; // tailwind hex
  priceMonthly: number;
  features: string[];
  recommended?: boolean;
};

export type PackageModel = Model<IPackage>;
