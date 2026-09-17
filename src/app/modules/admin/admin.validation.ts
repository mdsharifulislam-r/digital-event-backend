import { z } from 'zod';
import {USER_ROLES } from '../../../enums/user';

const createAdminZodSchema = z.object({
    body: z.object({
        name: z.string({ required_error: 'Name is required' }),
        email: z.string({ required_error: 'Email is required' }),
        password: z.string({ required_error: 'Password is required' }),
        role: z.nativeEnum(USER_ROLES, { required_error: 'Role is required' }),
        permissions: z.array(z.string()).optional(),
    })
});

export const AdminValidation = {
    createAdminZodSchema,
};
