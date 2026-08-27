import { z } from 'zod';

const getAnalyticsForProgrammesSchema = z.object({
  query: z.object({
    ids: z.array(z.string()).optional(),
    date_range: z.enum(['last7Days', 'last30Days', 'thisYear']),
  }),
});


const answerPollSchema = z.object({
  body: z.object({
    poll_id: z.string({ required_error: 'Poll ID is required' }),
    answer: z.string({ required_error: 'Answer is required' }),
    answer_id : z.string({ required_error: 'Answer ID is required' }),
  }),
})

const submitThoughtsSchema = z.object({
  body: z.object({
    proggrame: z.string({ required_error: 'Poll ID is required' }),
    thought: z.string({ required_error: 'Answer is required' }),
  }),
})

export const ProgrammesValidations = {
    getAnalyticsForProgrammesSchema,
    answerPollSchema,
    submitThoughtsSchema
};
