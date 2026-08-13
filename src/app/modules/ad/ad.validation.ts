import { z } from 'zod';

const createAdZodSchema = z.object({
    body: z.object({
        title: z.string({ required_error: 'Title is required' }),
        description: z.string({ required_error: 'Description is required' }),
        redirectUrl: z.string({ required_error: 'Redirect URL is required' }).url({ message: 'Invalid URL' }),
        startDate:z.coerce.date({ required_error: 'Start Date is required' }),
        endDate:z.coerce.date({ required_error: 'End Date is required' }),
        active:z.coerce.boolean({ required_error: 'Active is required' }),
    }),
});


const updateAdZodSchema = z.object({
    body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        redirectUrl: z.string().url({ message: 'Invalid URL' }).optional(),
        startDate:z.coerce.date().optional(),
        endDate:z.coerce.date().optional(),
        active:z.coerce.boolean().optional(),
    }),
});

const getBulkAdZodSchema = z.object({
    body: z.object({
        ids: z.array(z.string()).min(1, 'At least one ad id is required'),
    }),
});

const calculateDwellTimeZodSchema = z.object({
    body: z.object({
        item: z.string({ required_error: 'Item ID is required' }),
        type: z.enum(["Event", "Recommendations", "Ad", "Programmes"], { required_error: 'Type is required' }),
        startTime: z.coerce.date({ required_error: 'Start time is required' }),
        endTime: z.coerce.date({ required_error: 'End time is required' }),
    }),
});

export const AdValidations = {
    createAdZodSchema,
    updateAdZodSchema,
    getBulkAdZodSchema,
    calculateDwellTimeZodSchema
};
