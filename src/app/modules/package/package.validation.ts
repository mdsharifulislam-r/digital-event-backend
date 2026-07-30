import { z } from 'zod';

export const createPackageZodSchema = z.object({
  body: z.object({
  label: z
    .string({
      required_error: 'Label is required',
      invalid_type_error: 'Label must be a string',
    })
    .min(1, 'Label cannot be empty'),

  short: z
    .string({
      required_error: 'Short name is required',
      invalid_type_error: 'Short name must be a string',
    })
    .min(1, 'Short name cannot be empty'),

  audience: z
    .string({
      required_error: 'Audience is required',
      invalid_type_error: 'Audience must be a string',
    })
    .min(1, 'Audience cannot be empty'),

  modules: z
    .array(z.number({
      invalid_type_error: 'Each module must be a number',
    }), {
      required_error: 'Modules are required',
      invalid_type_error: 'Modules must be an array',
    })
    .min(1, 'At least one module is required'),

  can_charge: z.boolean({
    required_error: 'Can charge field is required',
    invalid_type_error: 'Can charge must be a boolean',
  }),

  description: z
    .string({
      required_error: 'Description is required',
      invalid_type_error: 'Description must be a string',
    })
    .min(1, 'Description cannot be empty'),

  color: z
    .string({
      required_error: 'Color is required',
      invalid_type_error: 'Color must be a string',
    })
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Invalid hex color'),

  priceMonthly: z
    .number({
      required_error: 'Monthly price is required',
      invalid_type_error: 'Monthly price must be a number',
    })
    .min(0, 'Monthly price cannot be negative'),

  features: z
    .array(z.string({
      invalid_type_error: 'Each feature must be a string',
    }), {
      required_error: 'Features are required',
      invalid_type_error: 'Features must be an array',
    })
    .min(1, 'At least one feature is required'),

  recommended: z.boolean({
    invalid_type_error: 'Recommended must be a boolean',
  }).optional(),
  vanues: z.number({
    required_error: 'Vanues is required',
    invalid_type_error: 'Vanues must be a number',
  }),
  programmes: z.number({
    required_error: 'Programmes is required',
    invalid_type_error: 'Programmes must be a number',
  }),
  is_proggramme_sell: z.boolean({
    required_error: 'is_proggramme_sell is required',
    invalid_type_error: 'is_proggramme_sell must be a boolean',
  })
}),
});

const updatePackageZodSchema = z.object({
  body: z.object({
  label: z
    .string({
      invalid_type_error: 'Label must be a string',
    })
    .min(1, 'Label cannot be empty')
    .optional(),

  short: z
    .string({
      invalid_type_error: 'Short name must be a string',
    })
    .min(1, 'Short name cannot be empty')
    .optional(),

  audience: z
    .string({
      invalid_type_error: 'Audience must be a string',
    })
    .min(1, 'Audience cannot be empty')
    .optional(),

  modules: z
    .array(
      z.number({
        invalid_type_error: 'Each module must be a number',
      }),
      {
        invalid_type_error: 'Modules must be an array',
      }
    )
    .min(1, 'At least one module is required')
    .optional(),

  can_charge: z
    .boolean({
      invalid_type_error: 'Can charge must be a boolean',
    })
    .optional(),

  description: z
    .string({
      invalid_type_error: 'Description must be a string',
    })
    .min(1, 'Description cannot be empty')
    .optional(),

  color: z
    .string({
      invalid_type_error: 'Color must be a string',
    })
    .regex(
      /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
      'Invalid hex color'
    )
    .optional(),

  priceMonthly: z
    .number({
      invalid_type_error: 'Monthly price must be a number',
    })
    .min(0, 'Monthly price cannot be negative')
    .optional(),

  features: z
    .array(
      z.string({
        invalid_type_error: 'Each feature must be a string',
      }),
      {
        invalid_type_error: 'Features must be an array',
      }
    )
    .min(1, 'At least one feature is required')
    .optional(),

  recommended: z
    .boolean({
      invalid_type_error: 'Recommended must be a boolean',
    })
    .optional(),
}),
});

export const PackageValidation = {
  createPackageZodSchema,
  updatePackageZodSchema,
};
