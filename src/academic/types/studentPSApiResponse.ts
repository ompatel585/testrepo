export interface IStudentPSApiResponse {
  studentDetailId: number;
  psDetails: {
    courseId: number;
    courseName: string;
    termId: number;
    termName: string;
    psSerialNo: string;
    psName: string; // PDF file name
    pspdf: string; // Base64 encoded PDF
  }[];
  certificateDetails: {
    courseId: number;
    courseName: string;
    certSerialNo: string;
    certName: string;
    certPDF: string; // Base64 encoded PDF
  }[];
}
