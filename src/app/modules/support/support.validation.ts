import { Types } from 'mongoose';
import { z } from 'zod';

export const supportSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),

  email: z.string().email(),

  contact: z.string().min(5),

  role: z.enum(["contractor", "homeowner"]),

  subject: z.string().min(1),

  message: z.string().min(1),
});

const createSupportMessageZodSchema = z.object({
    body:supportSchema
})

const replyToSupportMessageZodSchema = z.object({
    body:z.object({
        message:z.string()
    }),
    params:z.object({
        id:z.string().refine(val => Types.ObjectId.isValid(val), {
            message: 'Invalid ObjectId',
        })
    })
})


export const SupportValidations = {
    createSupportMessageZodSchema,
    replyToSupportMessageZodSchema
};
