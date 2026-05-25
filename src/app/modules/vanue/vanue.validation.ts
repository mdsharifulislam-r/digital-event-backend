import { z } from 'zod';

const createVanueZodSchema = z.object({
    body: z.object({
        data: z.string({ required_error: 'Data is required' }).refine((value) => {
            try {
                JSON.parse(value);
                return true;
            } catch (e) {
                return false;
            }
        }, 'Data must be a valid JSON string'),
    })
})

export const venueSchema = z.object({
  name: z.string({
    required_error: "Venue name is required",
  }),

  status: z.enum(["active", "suspended", "pending"], {
    required_error: "Status is required",
  }),

  description: z.string().optional(),

  address_line1: z.string({
    required_error: "Address line 1 is required",
  }),

  address_line2: z.string().optional(),

  city: z.string({
    required_error: "City is required",
  }),

  state: z.string().optional(),

  country: z.string({
    required_error: "Country is required",
  }),

  zip_code: z.string({
    required_error: "Zip code is required",
  }),

  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    }),

  contact_email: z.string().email({
    message: "Invalid email address",
  }),

  contact_phone: z.string().optional(),

  website: z.string().url().optional(),

  brand_color: z.string().optional(),

});

const updateVanueZodSchema = z.object({
    body: z.object({
        data: z.string({ required_error: 'Data is required' }).refine((value) => {
            try {
                JSON.parse(value);
                return true;
            } catch (e) {
                return false;
            }
        }, 'Data must be a valid JSON string'),
    }).refine((data) => {
        const parsedData = JSON.parse(data.data);
        const status = z.string().safeParse(parsedData.status);
        return status.success;
    }).optional()
});


export const VanueValidations = {
    createVanueZodSchema,
    updateVanueZodSchema,
};
