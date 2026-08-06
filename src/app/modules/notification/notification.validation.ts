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
        'specific_performance',
        'specific_programme'
      ]),

      event: objectIdSchema.optional(),
      vanue: objectIdSchema.optional(),
      proggramme: objectIdSchema.optional(),

      performance: objectIdSchema.optional(), // replace with detailed schema if you have one

      title: z.string().min(1, 'Title is required'),

      message: z.string().min(1, 'Message is required'),

      filePath: z
        .string()
        .optional(),

      referenceId: objectIdSchema.optional(),
      is_only_proggram_holder: z.boolean().optional(),
      extraPath: z.string().optional(),
      is_schedule_notification: z.boolean().optional(),
      schedule_time: z.coerce.date().refine((val) => !isNaN(val.getTime()), 'Invalid date').refine((val) => val > new Date(), 'Date must be in the future').optional(),
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

      if (data.target === 'specific_performance' && !data.performance) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['performance'],
          message: 'performance is required when target is specific_performance',
        });
      }

      if (data.target === 'specific_performance' && data.is_only_proggram_holder && !data.event) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['event'],
          message: 'event is required when target is specific_performance and is_only_proggram_holder is true',
        });
      }

      if (data.target === 'specific_programme' && !data.proggramme) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['proggramme'],
          message: 'proggramme is required when target is specific_programme',
        });
      }

      if(data.is_schedule_notification && !data.schedule_time) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['schedule_time'],
          message: 'schedule_time is required when is_schedule_notification is true',
        });
      }
    }),
});


export const NotificationValidation = {
  sendNotificationSchema,
};
