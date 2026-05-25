import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId',
})

export const sendNotificationSchema = z.object({
  body: z
    .object({
      target: z.enum([
        'all_proggame_holders',
        'specific_event',
        'specific_vanue',
      ]),

      event: objectIdSchema.optional(),
      vanue: objectIdSchema.optional(),

      performance: z.any().optional(), // replace with detailed schema if you have one

      title: z.string().min(1, 'Title is required'),

      message: z.string().min(1, 'Message is required'),

      filePath: z
        .enum([
          'booking',
          'payment',
          'general',
          'review',
          'referral',
          'subscription',
        ])
        .optional(),

      referenceId: objectIdSchema.optional(),
    })
    .superRefine((data, ctx) => {
      if (data.target === 'specific_event' && !data.event) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['event'],
          message: 'event is required when target is specific_event',
        });
      }

      if (data.target === 'specific_vanue' && !data.vanue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['vanue'],
          message: 'vanue is required when target is specific_vanue',
        });
      }
    }),
});


export const NotificationValidation = {
  sendNotificationSchema,
};
