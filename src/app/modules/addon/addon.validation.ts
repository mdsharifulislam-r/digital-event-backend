import { z } from 'zod';

export const AddonValidations = {
  createAddonSchema: z.object({
    body: z.object({
      label: z.string({
        required_error: 'Label is required',
      }),
      short: z.string({
        required_error: 'Short description is required',
      }),
      description: z.string({
        required_error: 'Description is required',
      }),
      bullets: z.array(z.string()).default([]),
      priceMonthly: z.number({
        required_error: 'Price is required',
      }).positive('Price must be positive'),
      color: z.string({
        required_error: 'Color is required',
      }),
      icon: z.string({
        required_error: 'Icon is required',
      }),
      linkedModule: z.number().optional(),
      capabilityKey: z.enum(['sponsored_listings', 'push_notifications', 'advanced_data_export'], {
        required_error: 'Capability key is required',
      }),
      status: z.enum(['live', 'coming_soon', 'archived'], {
        required_error: 'Status is required',
      }),
      availableOn: z.union([
        z.literal('all'),
        z.array(z.enum(['tier_1', 'tier_1_plus', 'tier_2', 'tier_3', 'tier_3_plus'])),
      ]).default('all'),
    }),
  }),

  updateAddonSchema: z.object({
    body: z.object({
      id: z.string().optional(),
      label: z.string().optional(),
      short: z.string().optional(),
      description: z.string().optional(),
      bullets: z.array(z.string()).optional(),
      priceMonthly: z.number().positive('Price must be positive').optional(),
      color: z.string().optional(),
      icon: z.string().optional(),
      linkedModule: z.number().optional(),
      capabilityKey: z.enum(['sponsored_listings', 'push_notifications', 'advanced_data_export']).optional(),
      status: z.enum(['live', 'coming_soon', 'archived']).optional(),
      availableOn: z.union([
        z.literal('all'),
        z.array(z.enum(['tier_1', 'tier_1_plus', 'tier_2', 'tier_3', 'tier_3_plus'])),
      ]).optional(),
    }),
  }),
};
