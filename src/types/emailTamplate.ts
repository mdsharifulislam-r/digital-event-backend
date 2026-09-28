export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};

export interface ISubscriptionExpired { email: string; name?: string; subscriptionName: string; endDate: string; renewUrl: string; }