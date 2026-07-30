import { z } from 'zod';

const getAnalyticsForProgrammesSchema = z.object({
  query: z.object({
    ids: z.array(z.string()).optional(),
    date_range: z.enum(['last7Days', 'last30Days', 'thisYear']),
  }),
});

export const ProgrammesValidations = {
    getAnalyticsForProgrammesSchema,
};
