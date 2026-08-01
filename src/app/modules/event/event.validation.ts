import { z } from 'zod';
import mongoose from 'mongoose';
import { EVENT_CATEGORIES } from './event.interface';

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

const parseJSON = (value: unknown) => {
  if (typeof value !== 'string') return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const objectIdSchema = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
  });


export const EVENT_STATUS = [
  'draft',
  'published',
  'cancelled',
] as const;

/* -------------------------------------------------------------------------- */
/*                              Nested Schemas                                */
/* -------------------------------------------------------------------------- */



const socialSchema = z.object({
  share_url: z.string().url().optional(),
  share_text: z.string().optional(),
  views_count: z.number().optional(),
});

const performanceSchema = z.object({
  start_time: z.string(),
    end_time: z.string(),
    type: z.enum(['matinee', 'evening', 'all_day']),
    date: z.coerce.date(),
  // your fields
});

const hostSchema = z.object({
    name: z.string(),
    username: z.string().optional(),
    avatar_url: z.string().url().optional(),
    bio: z.string().optional(),
});


const artistSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
})

/* -------------------------------------------------------------------------- */
/*                           FormData Compatible Schema                       */
/* -------------------------------------------------------------------------- */

export const createEventFormDataSchema = z.object({
    body:z.object({
  title: z.string().min(1),

  category: z.nativeEnum(EVENT_CATEGORIES),

  is_featured: z.preprocess((val) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }, z.boolean()).optional(),

  tags: z.preprocess(
    parseJSON,
    z.array(z.string()).default([])
  ),
  description_html: z.string(),

  address: z.string().optional(),

  status: z.enum(['draft', 'published', 'archived', 'cancelled']),

  price: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  }, z.number()),

  highlights: z.preprocess(
    parseJSON,
    z.array(z.string()).default([])
  ),

  event_date: z.coerce.date({ required_error: 'Event date is required' }),


  get_tickets_url: z.string().url().optional(),

  performances: z.preprocess(
    parseJSON,
    z.array(performanceSchema).default([])
  ),

  // host: z.preprocess(
  //   parseJSON,
  //   hostSchema
  // ),

  vanue: objectIdSchema,

  programme: objectIdSchema.optional(),

  social: z.preprocess(
    parseJSON,
    socialSchema
  ).optional(),

  nearby_restaurants: z.preprocess(
    parseJSON,
    z.array(objectIdSchema).optional()
  ),

  nearby_hotels: z.preprocess(
    parseJSON,
    z.array(objectIdSchema).optional()
  ),

  nearby_bars: z.preprocess(
    parseJSON,
    z.array(objectIdSchema).optional()
  ),
})
})

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type TCreateEventFormData = z.infer<
  typeof createEventFormDataSchema
>;



const makeFavoriteZodSchema = z.object({
  body: z.object({
    type: z.enum(["Event" , "Recommendations","Venue","Performances"]),
  }),
});


export const EventValidation = {
  createEventFormDataSchema,
  makeFavoriteZodSchema
};