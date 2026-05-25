import { Schema, model } from 'mongoose';
import { IAddon, AddonModel } from './addon.interface'; 

const addonSchema = new Schema<IAddon, AddonModel>({
  label: { type: String, required: true },
  short: { type: String, required: true },
  description: { type: String, required: true },
  bullets: { type: [String], required: true },
  priceMonthly: { type: Number, required: true },
  color: { type: String, required: true },
  icon: { type: String, required: true },
  linkedModule: { type: Number, required: true },
  capabilityKey: { type: String, required: true },
  status: { type: String, required: true },
  availableOn: { type: String, required: true },
}, {
  timestamps: true
});

export const Addon = model<IAddon, AddonModel>('Addon', addonSchema);
