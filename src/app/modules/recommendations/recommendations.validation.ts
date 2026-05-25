import { z } from 'zod';

const createRecommendationSchema = z.object({
    body: z.object({
        name: z.string({
            required_error: 'Name is required',
        }),
        category: z.string({
            required_error: 'Category is required',
        }),
        rating: z.string({
            required_error: 'Rating is required',
        }).refine((value) => {
            const num = parseFloat(value);
            return !isNaN(num) && num >= 0 && num <= 5;
        }, 'Rating must be a number between 0 and 5'),
        distance: z.string({
            required_error: 'Distance is required',
        }),
        price: z.string({
            required_error: 'Price is required',
        }),
        location: z.string({
            required_error: 'Location is required',
        }),
        description: z.string({
            required_error: 'Description is required',        
        }),
        website: z.string({
            required_error: 'Website is required',
        }).url('Invalid URL format'),
    })
})

const updateRecommendationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        category: z.string().optional(),
        rating: z.string().optional().refine((value) => {
            if (value === undefined) return true; // allow undefined for optional fields
            const num = parseFloat(value);
            return !isNaN(num) && num >= 0 && num <= 5;
        }, 'Rating must be a number between 0 and 5'),
        distance: z.string().optional(),
        price: z.string().optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        website: z.string().url('Invalid URL format').optional(),
    })
})


export const RecommendationsValidations = {
    createRecommendationSchema,
    updateRecommendationSchema
};
