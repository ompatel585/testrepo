import { MessageTemplateType } from '../sms.service';

export const mobileNumberChangeOtpTemplate = (otp: string): MessageTemplateType => {
  return {
    templateMessage: `${otp} is your OTP to change your phone number on Aptech ProConnect. It is valid for 10 minutes. Do not share this OTP with anyone. Ignore if not requested.`,
    templateId: '1107173760470560087',
  };
};

export const mobileNumberVerificationOtpTemplate = (otp: string): MessageTemplateType => {
  return {
    templateMessage: `${otp} is your OTP to verify your phone number on Aptech ProConnect. It is valid for 10 minutes. Do not share this OTP with anyone. Ignore if not requested.`,
    templateId: '1107173760463594919',
  };
};
