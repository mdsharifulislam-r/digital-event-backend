import { z } from 'zod';
import { ORGANIZATION_TYPE, USECASE_PLATFORM, USER_ROLES } from '../../../enums/user';
import { Types } from 'mongoose';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
    profile: z.string().optional(),
    role:z.nativeEnum(USER_ROLES, { required_error: 'Role is required' }),
    organization_type: z.nativeEnum(ORGANIZATION_TYPE).optional(),
    website: z.string().optional(),
    country: z.string().optional(),
    contact_name: z.string().optional(),
    phone: z.string().optional(),
    use_case: z.nativeEnum(USECASE_PLATFORM).optional(),
  }).refine((data) => {
    if (data.role === USER_ROLES.ORGANIZATION) {
      return(
      (data as any).organization_type !== undefined &&
      (data as any).website !== undefined &&
      (data as any).country !== undefined &&
      (data as any).contact_name !== undefined &&
      (data as any).phone !== undefined &&
      (data as any).use_case !== undefined
      )
    }
    return true
  }, 'Organization details are required'),
});



const createOrganizationZodSchema = z.object({
    organization_name: z.string({ required_error: 'Organization name is required' }),
    organization_type: z.nativeEnum(ORGANIZATION_TYPE, { required_error: 'Organization type is required' }),
    website: z.string({ required_error: 'Website is required' }),
    country: z.string({ required_error: 'Country is required' }),
    contact_name: z.string({ required_error: 'Contact name is required' }),
    phone: z.string({ required_error: 'Phone is required' }),
    use_case: z.nativeEnum(USECASE_PLATFORM, { required_error: 'Use case is required' }),
});

const updateUserZodSchema = z.object({
  name: z.string().optional(),
  contact: z.string().optional(),
  email: z.string().optional(),
  password: z.string().optional(),
  location: z.string().optional(),
  image: z.string().optional(),
});


const followUserZodSchema = z.object({
  body: z.object({
    hostId: z.string({ required_error: 'User ID is required' }).refine((value) => {
      return Types.ObjectId.isValid(value);
    }, 'Invalid ObjectId'),
    eventId: z.string({ required_error: 'Event ID is required' }).refine((value) => {
      return Types.ObjectId.isValid(value);
    }, 'Invalid ObjectId'),
  }),
})

const suspendUserZodSchema = z.object({
  body: z.object({
    days: z.number({ required_error: 'Days is required' }),
    reason: z.string({ required_error: 'Reason is required' }),
  }),
})


const deleteAccountZodSchema = z.object({
  body: z.object({
    password: z.string({ required_error: 'Password is required' }),
  }),
})

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
  createOrganizationZodSchema,
  followUserZodSchema,
  suspendUserZodSchema,
  deleteAccountZodSchema
};
