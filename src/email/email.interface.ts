// reference for
export interface EmailBody {
  to: string[];
  from: string | 'sunny.prajapati@aptech.ac.in';
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamic_template_data?: Record<string, any>;
}
