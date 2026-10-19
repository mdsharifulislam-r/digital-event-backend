import { Model, Types } from 'mongoose';
import { ORGANIZATION_TYPE, USECASE_PLATFORM, USER_ROLES } from '../../../enums/user';

export type IUser = {
  name: string;
  role: USER_ROLES;
  contact: string;
  email: string;
  password: string;
  appId: string;
  isSocial: boolean;
  social_type:"Google" | "Facebook"
  location: string;
  image?: string;
  status: 'active' | 'delete';
  verified: boolean;
  isSuspended?: boolean;
  suspendedAt?: Date;
  suspendedReason?: string;
  suspendedDays?: number;
  stripe_account_id?: string;
  stripe_login_link?: string;
  suspendedUntil?: Date;
  subscription:Types.ObjectId;
  fcmTokens?: string[];
  permissions: string[];
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;


export type IOrganization = {
  organization_name: string;
  organization_type: ORGANIZATION_TYPE;
  website: string;
  country: string;
  contact_name: string;
  phone: string;
  use_case : USECASE_PLATFORM,
  followers_count: number;

}

export type OrganizationModal = {
  isExistOrganizationById(id: string): any;
} & Model<IOrganization>;


export type IFaceVerification = {
  userId: Types.ObjectId;
  faceDescriptor: any;
  device_id: string;
}

export type FaceVerificationModal = {
} & Model<IFaceVerification>;


export type IFollower={
  follower:Types.ObjectId;
  following:Types.ObjectId;
}

export type FollowerModal = {
  followUser (follower: Types.ObjectId, following: Types.ObjectId): Promise<IFollower>;
} & Model<IFollower>;

export type ISuspendPayload ={
  days:number;
  reason:string;
}


export type ITempHoldWallet = {
  userId: Types.ObjectId;
  amount: number;
}

export type TempHoldWalletModal = {
  createTempHoldWallet(userId: Types.ObjectId, amount: number,session?:any): Promise<ITempHoldWallet>;
} & Model<ITempHoldWallet>;


export interface IOrganisationBilling {
  organisationId: Types.ObjectId;
  stripeCustomerId?: string;
  defaultPaymentMethodId: string | null;

  cardStatus: "missing" | "pending" | "ready" | "failed";

  consent: {
    accepted: boolean;
    termsVersion?: string;
    acceptedAt?: Date;
    actorUserId?: Types.ObjectId;
    consentText?: string;
  };

  outstandingBalancePence: number;
  billingEnabled: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}


export type OrganisationBillingModal = {
} & Model<IOrganisationBilling>;