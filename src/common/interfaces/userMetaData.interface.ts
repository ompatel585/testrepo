import { ILAPAMarks } from '../entities/user-metadata.entity';

export interface ICoursesMetaDataMap {
  id: number;
  name: string;
  description: string;
  completion: number;
}

export interface IBooksMetaDataMap {
  id: number;
  name: string;
  description: string;
  terms: {
    id: number;
    name: string;
    books: {
      id: number;
      aptrack_1_book_id: number;
      title: string;
      thumbnail: string | null;
      courseId: number;
      termId: number;
    }[];
  }[];
}

export interface IEmployeeBooksMetaDataMap {
  id: number;
  aptrack_1_book_id: number;
  title: string;
  thumbnail: string | null;
  bookDescription: string;
}

export interface IAttendanceMetaDataMap {
  id: number;
  name: string;
  description: string;
  totalSession: number;
  sessionAttend: number;
  attendancePercent: number;
  terms: {
    id: number;
    name: string;
    totalSession: number;
    sessionAttend: number;
    attendancePercent: number;
  }[];
}

export interface IMarksMetaDataMap {
  id: number;
  name: string;
  description: string;
  MarksCategory: string;
  MAACNonIPVADGrade: string;
  LAPAMarks: ILAPAMarks | null;
  terms: {
    id: number;
    name: string;
    marks: {
      id: number;
      name: string;
      totalMarks: number;
      obtainedMarks: number;
      weightAge: number;
    }[];
  }[];
}

export interface ICertificatesMetaDataMap {
  id: number;
  name: string;
  description: string;
  certificateSerialNo: string;
  certificateName: string;
  lapaePSSerialNo: string;
  lapaePSName: string;
  url: string | null;
  terms: {
    id: number;
    name: string;
    certificateSerialNo: string;
    certificateName: string;
    url: string | null;
  }[];
}
