import { MessageTemplateType } from '../sms.service';

export const passwordUpdateSmsTemplate = (
  userId: string,
  newPassword: string,
): MessageTemplateType => {
  return {
    templateMessage: `Your login details have been updated. User ID: ${userId}. New Password: ${newPassword}. Keep this information secure and do not share it.`,
    templateId: '',
  };
};
