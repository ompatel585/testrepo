import { getAptrack2BrandIdList } from 'src/common/constants';
import { IAptrack2EmployeeMetaData } from 'src/common/entities/user-metadata.entity';
import { axiosRequest, MethodEnum } from 'src/common/helper/axiosRequest.helper';
import {
  formatAptrack1CEMetaDataIntoAptrack1,
  formatAptrack2CEMetaDataIntoAptrack1,
} from 'src/common/helper/userMetaData.helper';

export const checkStudentExitsWithBC = async (StudentId: string, BCNo: string) => {
  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_ONE_BASE_URL}/get-student-details`,
    { StudentId, BCNo },
    {
      'X-Auth-Key': `${process.env.APTRACK_ONE_TOKEN}`,
      'X-Username': `${process.env.APTRACK_ONE_AUTH_USERNAME}`,
    },
  );
};

export const checkStudentExitsWithBCAptrack2 = async (
  StudentId: string,
  BCNo: string,
) => {
  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_TWO_BASE_URL}/get-student-detail`,
    { StudentId, BCNo },
    {
      'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
      'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
    },
  );
};

export const checkFacultyExitsWithPass = async (
  username: string,
  password: string,
): Promise<IAptrack2EmployeeMetaData> => {
  const aptrack1Employee = await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_ONE_BASE_URL}/v1/get-faculty-details`,
    { username, password },
    {
      'X-Auth-Key': `${process.env.APTRACK_ONE_TOKEN}`,
      'X-Username': `${process.env.APTRACK_ONE_AUTH_USERNAME}`,
    },
  );

  return aptrack1Employee;
};

export const checkFacultyExitsWithPassFromAptrack2 = async (
  username: string,
  password: string,
): Promise<IAptrack2EmployeeMetaData> => {
  const aptrack2Employee = await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_TWO_BASE_URL}/get-faculty-details`,
    { username, password },
    {
      'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
      'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
    },
  );

  return aptrack2Employee;
  // return formatAptrack2CEMetaDataIntoAptrack1(aptrack2Employee);
};

export const getStudentDetails = async (
  StudentId: string,
  Type: string = 'ALL',
  brandId?: number,
) => {
  // aptrack1 or aptrack2 basis brandId
  if (brandId && getAptrack2BrandIdList().includes(brandId)) {
    return await axiosRequest(
      MethodEnum.Post,
      `${process.env.APTRACK_TWO_BASE_URL}/get-student-detail`,
      { StudentId, Type },
      {
        'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
        'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
      },
    );
  }

  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_ONE_BASE_URL}/get-student-details`,
    { StudentId, Type },
    {
      'X-Auth-Key': `${process.env.APTRACK_ONE_TOKEN}`,
      'X-Username': `${process.env.APTRACK_ONE_AUTH_USERNAME}`,
    },
  );
};

export const getStudentDetailsFromAptrack2 = async (
  StudentId: string,
  Type: string = 'ALL',
  brandId?: number,
) => {
  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_TWO_BASE_URL}/get-student-detail`,
    { StudentId, Type },
    {
      'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
      'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
    },
  );
};

// also call for aptrack 2 and modify response to aptrack 1 and brandId optional
export const getAptrackEmployeeProfileDetails = async ({
  username,
  brandId,
}: {
  username: string;
  brandId: number;
}): Promise<IAptrack2EmployeeMetaData> => {
  if (brandId && getAptrack2BrandIdList().includes(brandId)) {
    const aptrack2Employee = await axiosRequest(
      MethodEnum.Post,
      `${process.env.APTRACK_TWO_BASE_URL}/get-faculty-details`,
      { username },
      {
        'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
        'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
      },
    );
    return aptrack2Employee;
  }

  const aptrack1Employee = await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_ONE_BASE_URL}/v1/get-faculty-details`,
    { username },
    {
      'X-Auth-Key': `${process.env.APTRACK_ONE_TOKEN}`,
      'X-Username': `${process.env.APTRACK_ONE_AUTH_USERNAME}`,
    },
  );

  return aptrack1Employee;
};

export const getAptrackEmployeeProfileDetailsFromAptrack2 = async (
  username: string,
): Promise<IAptrack2EmployeeMetaData> => {
  const aptrack2Employee = await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_TWO_BASE_URL}/get-faculty-details`,
    { username },
    {
      'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
      'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
    },
  );
  return aptrack2Employee;
  // return formatAptrack2CEMetaDataIntoAptrack1(aptrack2Employee);
};

// also call for aptrack 2 and modify response to aptrack 1 and brandId optional
export const getAptrackEmployeeBookDetails = async ({
  username,
  role,
  brandId,
}: {
  username: string;
  role: string;
  brandId?: number;
}) => {
  if (brandId && getAptrack2BrandIdList().includes(brandId)) {
    const aptrack2Employee = await axiosRequest(
      MethodEnum.Post,
      `${process.env.APTRACK_TWO_BASE_URL}/get-faculty-books`,
      { username, role },
      {
        'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
        'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
      },
    );

    return aptrack2Employee;
  }

  const aptrack1Employee = await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_ONE_BASE_URL}/v1/get-faculty-books`,
    { username, role },
    {
      'X-Auth-Key': `${process.env.APTRACK_ONE_TOKEN}`,
      'X-Username': `${process.env.APTRACK_ONE_AUTH_USERNAME}`,
    },
  );

  return aptrack1Employee;
};

export const fetchStudentCertificateByFileName = async (
  fileName: string,
  brandId: number,
) => {
  if (getAptrack2BrandIdList().includes(brandId)) {
    return await axiosRequest(
      MethodEnum.Post,
      `${process.env.APTRACK_TWO_BASE_URL}/get-student-cert`,
      { FileName: fileName },
      {
        'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
        'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
      },
    );
  }

  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_ONE_BASE_URL}/get-student-cert`,
    { FileName: fileName },
    {
      'X-Auth-Key': `${process.env.APTRACK_ONE_TOKEN}`,
      'X-Username': `${process.env.APTRACK_ONE_AUTH_USERNAME}`,
    },
  );
};

export const fetchStudentPaymentDetails = async (StudentId: string, brandId: number) => {
  if (getAptrack2BrandIdList().includes(brandId)) {
    return await axiosRequest(
      MethodEnum.Post,
      `${process.env.APTRACK_TWO_BASE_URL}/get-studentBCReceipt-list`,
      { StudentId: StudentId },
      {
        'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
        'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
      },
    );
  }

  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_ONE_BASE_URL}/get-studentBCReceipt-list`,
    { StudentId: StudentId },
    {
      'X-Auth-Key': `${process.env.APTRACK_ONE_TOKEN}`,
      'X-Username': `${process.env.APTRACK_ONE_AUTH_USERNAME}`,
    },
  );
};

export const generatedBCReceiptPdfFile = async ({
  StudentDetailId,
  CentreId,
  BCParentId,
}: {
  StudentDetailId: number;
  CentreId: number;
  BCParentId: number;
}) => {
  // if (getAptrack2BrandIdList().includes(brandId)) {
  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_TWO_BASE_URL}/GenerateDomesticBCDocs`,
    { StudentDetailId: StudentDetailId, CentreId: CentreId, BCParentId: BCParentId },
    {
      'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
      'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
    },
    {
      responseType: 'arraybuffer',
    },
  );
  // }
};

export const fetchStudentTransactionDetails = async (
  StudentId: string,
  brandId: number,
) => {
  if (getAptrack2BrandIdList().includes(brandId)) {
    return await axiosRequest(
      MethodEnum.Post,
      `${process.env.APTRACK_TWO_BASE_URL}/get-studentTransactionDetails`,
      { StudentId: StudentId },
      {
        'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
        'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
      },
    );
  }

  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_ONE_BASE_URL}/get-studentTransactionDetails`,
    { StudentId: StudentId },
    {
      'X-Auth-Key': `${process.env.APTRACK_ONE_TOKEN}`,
      'X-Username': `${process.env.APTRACK_ONE_AUTH_USERNAME}`,
    },
  );
};

export const sendPaymentRequestToAptrack = async (
  aptrackPaymentReqPayload: IAptrack01PaymentRequest,
  brandKey: number,
) => {
  if (getAptrack2BrandIdList().includes(brandKey)) {
    return await axiosRequest(
      MethodEnum.Post,
      `${process.env.APTRACK_TWO_BASE_URL}/SaveStudentPaymentDetail`,
      aptrackPaymentReqPayload,
      {
        'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
        'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
      },
    );
  }

  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_ONE_BASE_URL}/SaveStudentPaymentDetail`,
    aptrackPaymentReqPayload,
    {
      'X-Auth-Key': `${process.env.APTRACK_ONE_TOKEN}`,
      'X-Username': `${process.env.APTRACK_ONE_AUTH_USERNAME}`,
    },
  );
};

export const sendPaymentResponseToAptrack = async (
  aptrackPaymentResPayload: Partial<IAptrack01PaymentResponse>,
  brandKey: number,
) => {
  if (getAptrack2BrandIdList().includes(brandKey)) {
    return await axiosRequest(
      MethodEnum.Post,
      `${process.env.APTRACK_TWO_BASE_URL}/StudentPaymentResponseDetail`,
      aptrackPaymentResPayload,
      {
        'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
        'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
      },
    );
  }

  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_ONE_BASE_URL}/StudentPaymentResponseDetail`,
    aptrackPaymentResPayload,
    {
      'X-Auth-Key': `${process.env.APTRACK_ONE_TOKEN}`,
      'X-Username': `${process.env.APTRACK_ONE_AUTH_USERNAME}`,
    },
  );
};

export const fetchPaymentReceiptDataByReceiptHeaderId = async (
  receiptHeaderId: string,
) => {
  return await axiosRequest(
    MethodEnum.Get,
    `${process.env.APTRACK_TWO_BASE_URL}/GetPrintReceipt?receiptHeaderId=${receiptHeaderId}`,
    {},
    {
      'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
      'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
    },
  );
};

export const updateStudentDetailsToAptrack02 = async (
  studentId: string,
  mobile: string | null = null,
  email: string | null = null,
) => {
  const payload = {
    studentId,
    ...(mobile && { mobile }),
    ...(email && { email }),
  };

  return await axiosRequest(
    MethodEnum.Post,
    `${process.env.APTRACK_TWO_BASE_URL}/update-student-details`,
    payload,
    {
      'X-Auth-Key': `${process.env.APTRACK_TWO_TOKEN}`,
      'X-Username': `${process.env.APTRACK_TWO_AUTH_USERNAME}`,
    },
  );
};
