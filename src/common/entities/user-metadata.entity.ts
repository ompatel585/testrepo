import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { BrandUniversityCode } from '../enum/brand.enum';

export interface ILAPAMarks {
  TheoryAssessmentScore: number;
  PracticalAssessmentScore: number;
  OverallAssessmentScore: number;
  Grade: string;
  LAPARubricMarks: Array<{
    ExamType: string;
    Rubric: string;
    ObtainedMarks: number;
    TotalMarks: number;
  }>;
}

export interface IStudentMetaData {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: Date;
  mobile: string;
  email: string;
  isEmailVerified: number;
  isMobileVerified: number;
  address: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  brandId: string;
  isDomestic: boolean;
  userId: string;
  IsEnrolled: boolean;
  UniversityCode: BrandUniversityCode;
  CenterDetails: {
    BrandId: number;
    BrandCode: string;
    Zone: string;
    Region: string;
    Area: string;
    CentreId: number;
    CentreName: string;
    CNCCode: string;
    SAPCode: string;
    StateName: string;
    CityName: string;
  };
  BC: [
    {
      BCNo: string;
      BCDate: string;
      Amount: number;
      TaxAmount: number;
      Courses: Array<{
        CourseId: number;
        CourseCode: string;
        ACC1: string;
        ACC1BrandID: number;
        isDoSelect: boolean;
        CourseName: string;
        CourseFamilyName: string;
        CourseType: string;
        TotalSession: number;
        SessionAttend: number;
        AttendacePercentage: number;
        MarksCategory: string;
        MAACNonIPVADGrade: string;
        LAPAMarks: ILAPAMarks | null;
        CertSerialNo: string;
        CertName: string;
        LAPAePSSerialNo: string;
        LAPAePSName: string;
        Terms: Array<{
          TermId: number;
          TermCode: string;
          TermName: string;
          TotalSession: number;
          SessionAttended: number;
          AttendacePercentage: number;
          PSSerialNo: string;
          PSName: string;
          Marks: Array<{
            ComponentName: string;
            TotalMarks: number;
            ObtainedMarks: number;
          }>;
          Modules: Array<{
            ModuleId: number;
            ModuleCode: string;
            ModuleName: string;
            TotalSession: number;
            SessionAttend: number;
            AttendancePercent: number;
            Books: Array<{
              BookId: number;
              BookCode: string;
              BookName: string;
              BookDescription: string;
              BookType: string;
            }>;
          }>;
        }>;
      }>;
    },
  ];
}

export interface IAptrackEmployeeMetaData {
  userType: 'AE' | 'CE';
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: Date;
  mobile: string;
  email: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  brandId: number;
  brandIds: Array<number>;
  centerId: number;
  centerIds: Array<number>;
  isDomestic: boolean;
  UniversityCode: string;
  SubBrands: Array<{
    ACC1: string;
    ACC1BrandID: number;
  }>;
  Role: Array<string>;
  Books: Array<{
    BookId: number;
    BookCode: string;
    BookName: string;
    BookDescription: string;
    BookType: string;
  }>;
  CenterDetails: {
    BrandId: number;
    BrandCode: string;
    Zone: string;
    Region: string;
    Area: string;
    CentreId: number;
    CentreName: string;
    CNCCode: string;
    SAPCode: string;
    StateName: string;
    CityName: string;
  } | null;
  TopAccess: Array<{
    AccessType: string;
    BrandId: number;
    Zone: string;
    Region: string;
    Area: string;
    Centre: string;
  }> | null;
}

export interface IAptrack2EmployeeMetaData {
  userType: 'AE' | 'CE';
  userId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dob: Date;
  mobile: string;
  email: string;
  address: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  UniversityCode: string;
  isDomestic: boolean;
  brandIds: BrandRole[];
  SubBrands: SubBrands[];
  Books: Array<{
    BookId: number;
    BookCode: string;
    BookName: string;
    BookDescription: string;
    BookType: string;
  }>;
  TopAccess: TopAccessItem[];
}

/* Top Access Interface */
export interface AccessDetails {
  AccessType: string;
  BrandId: number;
  Zone: string;
  Region: string;
  Area: string;
  CentreId: number;
  Centre: string;
}

interface RoleAccess {
  Role: string;
  AcessDetails: AccessDetails[];
}

export interface TopAccessItem {
  BrandId: number;
  RoleAcess: RoleAccess[];
}
/* Top Access Interface */

export interface SubBrands {
  ACC1: string;
  ACC1BrandID: number;
}

interface CentreDetails {
  BrandId: number;
  BrandCode: string;
  Zone: string;
  Region: string;
  Area: string;
  CentreId: number;
  CentreName: string;
  CNCCode: string;
  SAPCode: string;
  StateName: string;
  CityName: string;
}

interface RoleCentre {
  Role: string;
  CentreDetails: CentreDetails[];
}

export interface BrandRole {
  BrandId: number;
  RoleCentre: RoleCentre[];
}

export interface IAptrackStudentPGMetaData {
  Invoice_Header_ID: number;
  Enquiry_Regn_ID: string;
  SAP_Customer_Id: string;
  Student_Status: string;
  Student_Detail_ID: string;
  CenterId: number;
  BCNo: string;
  UniversityCode: string;
}

@Entity()
@Index('idx_UserMetaData_user_id', ['userId'])
export class UserMetaData {
  @PrimaryColumn()
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ type: 'jsonb', nullable: true, default: null })
  metaData: IStudentMetaData | IAptrack2EmployeeMetaData | null;

  @Column({ type: 'jsonb', nullable: true, default: null })
  pgMetaData: IAptrackStudentPGMetaData[];

  @CreateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
