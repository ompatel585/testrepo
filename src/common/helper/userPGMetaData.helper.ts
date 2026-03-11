import { IAptrackStudentPGMetaData } from '../entities/user-metadata.entity';
import { BusinessException } from '../exceptions/business.exception';

export function validateUserPGMetaData(
  userPGMetaData: IAptrackStudentPGMetaData,
): IAptrackStudentPGMetaData {
  if (!userPGMetaData || typeof userPGMetaData !== 'object') {
    throw new BusinessException("we couldn't verify your details please try again later");
  }

  const requiredFields: (keyof IAptrackStudentPGMetaData)[] = [
    'Invoice_Header_ID',
    'Enquiry_Regn_ID',
    'SAP_Customer_Id',
    'Student_Status',
    'Student_Detail_ID',
    'CenterId'
  ];

  for (const field of requiredFields) {
    if (
      !(field in userPGMetaData) ||
      userPGMetaData[field] === undefined ||
      userPGMetaData[field] === null ||
      userPGMetaData[field]?.toString().trim() === ''
    ) {
      throw new BusinessException(
        "we couldn't verify your details please try again later",
      );
    }
  }
  return userPGMetaData;
}
