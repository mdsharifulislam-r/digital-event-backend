import { ICreateAccount, IResetPassword } from '../types/emailTamplate';

const LOGO = 'https://res.cloudinary.com/dkbcx9amc/image/upload/v1785595063/logo_1_gq04qz.png';

const createAccount = (values: ICreateAccount) => {
  return {
    to: values.email,
    subject: 'Verify your SHOWE account',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#071B2C;font-family:Arial,Helvetica,sans-serif;color:#E5E7EB;">
  <div style="max-width:640px;margin:40px auto;background:#0B2238;border:1px solid #15344F;border-radius:20px;overflow:hidden;">

    <div style="padding:32px;text-align:center;background:linear-gradient(180deg,#0D2742 0%,#0B2238 100%);">
      <img src="${LOGO}" alt="SHOWE" style="width:140px;margin-bottom:24px;" />
      <h1 style="margin:0;font-size:32px;color:#FFFFFF;font-weight:700;">Welcome to SHOWE</h1>
      <p style="margin:16px 0 0;color:#D1D5DB;font-size:16px;line-height:1.7;">
        Step into the story before the curtain rises.
      </p>
    </div>

    <div style="padding:40px 32px;">
      <p style="margin:0 0 16px;font-size:18px;color:#FFFFFF;">
        Hi ${values.name},
      </p>

      <p style="margin:0 0 28px;color:#D1D5DB;font-size:16px;line-height:1.8;">
        Verify your SHOWE account to access your digital programme in seconds,
        discover the people and moments behind the event, and experience every moment
        before, during, and after.
      </p>

      <div style="text-align:center;margin:36px 0;">
        <div style="display:inline-block;background:#F5B400;color:#071B2C;font-size:34px;font-weight:700;letter-spacing:8px;padding:18px 32px;border-radius:16px;">
          ${values.otp}
        </div>
      </div>

      <p style="text-align:center;color:#D1D5DB;font-size:15px;margin:0;">
        This verification code is valid for
        <strong style="color:#F5B400;">3 minutes</strong>.
      </p>

      <div style="margin:40px 0;border-top:1px solid #1E3A56;"></div>

      <p style="margin:0;color:#9CA3AF;font-size:14px;line-height:1.7;">
        If you didn't create a SHOWE account, you can safely ignore this email.
      </p>
    </div>

    <div style="padding:24px 32px;background:#081827;border-top:1px solid #15344F;text-align:center;">
      <p style="margin:0;color:#9CA3AF;font-size:13px;">
        SHOWE — Your digital event experience platform
      </p>
    </div>
  </div>
</body>
</html>
`,
  };
};

const resetPassword = (values: IResetPassword) => {
  return {
    to: values.email,
    subject: 'Reset your SHOWE password',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#071B2C;font-family:Arial,Helvetica,sans-serif;color:#E5E7EB;">
  <div style="max-width:640px;margin:40px auto;background:#0B2238;border:1px solid #15344F;border-radius:20px;overflow:hidden;">

    <div style="padding:32px;text-align:center;background:linear-gradient(180deg,#0D2742 0%,#0B2238 100%);">
      <img src="${LOGO}" alt="SHOWE" style="width:140px;margin-bottom:24px;" />
      <h1 style="margin:0;font-size:30px;color:#FFFFFF;font-weight:700;">
        Password reset request
      </h1>
      <p style="margin:16px 0 0;color:#D1D5DB;font-size:16px;line-height:1.7;">
        Secure access to your event experience.
      </p>
    </div>

    <div style="padding:40px 32px;">
      <p style="margin:0 0 16px;font-size:18px;color:#FFFFFF;">
        Hello,
      </p>

      <p style="margin:0 0 28px;color:#D1D5DB;font-size:16px;line-height:1.8;">
        We received a request to reset your SHOWE password.
        Use the verification code below to continue securely.
      </p>

      <div style="text-align:center;margin:36px 0;">
        <div style="display:inline-block;background:#F5B400;color:#071B2C;font-size:34px;font-weight:700;letter-spacing:8px;padding:18px 32px;border-radius:16px;">
          ${values.otp}
        </div>
      </div>

      <p style="text-align:center;color:#D1D5DB;font-size:15px;margin:0;">
        This code is valid for
        <strong style="color:#F5B400;">3 minutes</strong>.
      </p>

      <div style="margin:40px 0;border-top:1px solid #1E3A56;"></div>

      <p style="margin:0;color:#9CA3AF;font-size:14px;line-height:1.8;">
        If you didn't request a password reset, you can safely ignore this email.
        Your SHOWE account will remain secure, and no changes will be made.
      </p>
    </div>

    <div style="padding:24px 32px;background:#081827;border-top:1px solid #15344F;text-align:center;">
      <p style="margin:0;color:#9CA3AF;font-size:13px;">
        SHOWE — Before, during, and after every event
      </p>
    </div>
  </div>
</body>
</html>
`,
  };
};

export const emailTemplate = {
  createAccount,
  resetPassword,
};