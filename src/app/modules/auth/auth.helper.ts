import generateOTP from "../../../util/generateOTP";
import { User } from "../user/user.model";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailHelper } from "../../../helpers/emailHelper";

const unverifiedAccountHandle = async (email: string) => {
  const otp = generateOTP();
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 3 * 60000),
  };
  const user = await User.findOne({ email });
  await User.findOneAndUpdate({ email }, { $set: { authentication } });
  const values = {
    otp: otp,
    email: email,
    name: user?.name!,
  };
  const createAccountTemplate = emailTemplate.createAccount(values);
  // fire-and-forget email sending; callers will handle responses
  emailHelper.sendEmail(createAccountTemplate);

  return {
    success: true,
    statusCode: 400,
    message: 'Account is not verified. Please check your email for verification code.',
    suggestRoute: '/api/v1/auth/verify-email',
    email,
  };
};


export const AuthHelper = {
    unverifiedAccountHandle
}