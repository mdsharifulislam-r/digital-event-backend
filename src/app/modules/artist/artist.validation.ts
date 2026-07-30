import { z } from 'zod';

const parseJSON = (value: unknown) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseNumber = (value: unknown) => {
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? value : parsed;
  }
  return value;
};

const createArtistZodSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    type: z.enum(["Solo Artist", "Band", "DJ", "Orchestra", "Comedian", "Speaker"], {
      required_error: 'Type is required',
    }),
    genres: z.array(z.string()).optional(),
    instruments: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    career_start_year: z.coerce.number(),
    origin: z.string().optional(),
    short_description: z.string().optional(),
    category: z.string().optional(),
  }),
});

const updateArtistZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    type: z.enum(["Solo Artist", "Band", "DJ", "Orchestra", "Comedian", "Speaker"]).optional(),
    genres: z.array(z.string()).optional(),
    instruments: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    career_start_year: z.coerce.number().optional(),
    origin: z.string().optional(),
    short_description: z.string().optional(),
    category: z.string().optional(),
  }),
});

export const ArtistValidations = {
  createArtistZodSchema,
  updateArtistZodSchema,
};
