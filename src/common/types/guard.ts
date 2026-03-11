import { ProfileResponseType, UserPGProfileType } from '.';
import {
  IAptrack2EmployeeMetaData,
  IAptrackEmployeeMetaData,
  IStudentMetaData,
} from '../entities/user-metadata.entity';

export function isStudentProfileResponse(obj: any): obj is ProfileResponseType {
  return obj && typeof obj === 'object' && 'address' in obj && 'firstName' in obj;
}

export function isStudentMetaData(obj: any): obj is IStudentMetaData {
  return obj && typeof obj === 'object' && Array.isArray(obj.BC);
}

export function isAptrackEmployeeMetaData(obj: any): obj is IAptrack2EmployeeMetaData {
  return 'userType' in obj;
}

export function isUserPGProfileType(obj: any): obj is UserPGProfileType {
  return (
    obj &&
    typeof obj === 'object' &&
    'I_Invoice_Header_ID' in obj &&
    'I_Enquiry_Region_ID' in obj &&
    'SAP_Customer_Id' in obj &&
    'Student_Status' in obj &&
    'CenterId' in obj
  );
}
