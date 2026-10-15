import { z } from 'zod';

const createVerifyEmailZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    oneTimeCode: z.number({ required_error: 'One time code is required' }),
  }),
});

const createLoginZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const createForgetPasswordZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
  }),
});

const createResetPasswordZodSchema = z.object({
  body: z.object({
    newPassword: z.string({ required_error: 'Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

const createChangePasswordZodSchema = z.object({
  body: z.object({
    currentPassword: z.string({
      required_error: 'Current Password is required',
    }),
    newPassword: z.string({ required_error: 'New Password is required' }),
    confirmPassword: z.string({
      required_error: 'Confirm Password is required',
    }),
  }),
});

const saveFaceDiscriminatorZodSchema = z.object({
  body: z.object({
    device_id: z.string({ required_error: 'Device ID is required' }),
  }),
});


const socialSignInZodSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }),
    name: z.string({ required_error: 'Name is required' }),
    picture: z.string({ required_error: 'Picture is required' }),
    appId: z.string({ required_error: 'App ID is required' }),
    social_type:z.enum(["Facebook", "Google"], { required_error: 'Social type is required' }),
  }),
})

export const AuthValidation = {
  createVerifyEmailZodSchema,
  createForgetPasswordZodSchema,
  createLoginZodSchema,
  createResetPasswordZodSchema,
  createChangePasswordZodSchema,
  saveFaceDiscriminatorZodSchema,
  socialSignInZodSchema
};
