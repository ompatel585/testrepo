import { Profile } from '../entities/profile.entity';

export type ProfileResponseType = Profile;

export type UserPGProfileType = ProfileResponseType & {
  I_Invoice_Header_ID: number;
  I_Enquiry_Region_ID: string;
  SAP_Customer_Id: string;
  Student_Status: string;
  I_Student_Detail_ID: string;
  CenterId: number;
};
