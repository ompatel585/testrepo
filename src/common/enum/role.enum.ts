import { AptrackRole } from './aptrack-role.enum';

export enum Role {
  Student = 'student',
  Admin = 'admin',
  Org = 'org',
  Guest = 'guest',
  Faculty = 'faculty',
  Judge = 'judge',
  Service = 'service',
  // PlacementSuperAdmin = 'placementSuperAdmin',
  // PlacementAdmin = 'placementAdmin', // old
  // PlacementUser = 'placementUser', // old
  // CentreAdmin = 'centreAdmin',
  // CentreUser = 'centreUser',
  CH = 'CH',
  CAH = 'CAH',
  CenterEmployee = 'centerEmployee', // CenterEmployee
  AptrackEmployee = 'aptrackEmployee', // AptrackEmployee
  IntJury = 'intJury',
  ExtJury = 'extJury',
  Moderator = 'moderator',
  DigitalAuditor = 'digitalAuditor',
  PM = 'PM', // Placement Manager
  PE = 'PE', // Placement Executive
  RAH = 'RAH', // Regional Academic Head
  ZAH = 'ZAH', // Zonal Academic Head
  NAH = 'NAH', // National Academic Head
  NPH = 'NPH', // National Placement Head
  APNAM = 'APNAM', //Aptech National Academic Manager
  ASH = 'ASH', // Area Sales Head
  CoH = 'CoH', //Content Head
  CCE = 'CCE', //Customer Care Executive
  CCH = 'CCH', //Customer Care Head
  LAPARAH = 'LAPARAH', //LAPA Regional Academic Head
  M_EX = 'M_EX', //MAAC Exam Head
  NOH = 'NOH', //National Operations Head
  NSH = 'NSH', //National Sales Head
  OE = 'OE', //Operations Executive
  OM = 'OM', //Operations Manager
  P1 = 'P1', //Portal Support Executive
  PSH = 'PSH', //Portal Support Head
  RSH = 'RSH', //Region Sales Head
  ZSH = 'ZSH', //Zonal Sales Head
}

// user-role-enum only for user table
export enum User_Role_Enum {
  Student = 'student',
  Admin = 'admin',
  Guest = 'guest',
  Faculty = 'faculty',
  Judge = 'judge',
  PlacementSuperAdmin = 'placementSuperAdmin',
  PlacementAdmin = 'placementAdmin',
  PlacementUser = 'placementUser',
  CentreAdmin = 'centreAdmin',
  CentreUser = 'centreUser',
  CH = 'CH',
  CAH = 'CAH',
  IntJury = 'intJury',
  ExtJury = 'extJury',
  Moderator = 'moderator',
}

export enum AssignableRolesEnum {
  PlacementSuperAdmin = 'placementSuperAdmin',
  PlacementAdmin = 'placementAdmin',
  PlacementUser = 'placementUser',
  CentreAdmin = 'centreAdmin',
  CentreUser = 'centreUser',
  Judge = 'judge',
}

// user with these roles are eligible for deletion
export enum RolesEligibleForDeletion {
  PlacementSuperAdmin = 'placementSuperAdmin',
  PlacementAdmin = 'placementAdmin',
  PlacementUser = 'placementUser',
  CentreAdmin = 'centreAdmin',
  CentreUser = 'centreUser',
}

export const ProconnectCenterEmployeeTypeRolesArray = [Role.Faculty, Role.CH, Role.CAH];
export const ProconnectAptrackEmployeeTypeRolesArray = [
  Role.APNAM,
  Role.ASH,
  Role.CoH,
  Role.CCE,
  Role.CCH,
  Role.LAPARAH,
  Role.M_EX,
  Role.NAH,
  Role.NOH,
  Role.NPH,
  Role.NSH,
  Role.OE,
  Role.OM,
  Role.PE,
  Role.PM,
  Role.P1,
  Role.PSH,
  Role.RSH,
  Role.RAH,
  Role.ZAH,
  Role.ZSH,
];

export const ProconnectAllEmployeeTypeRolesArray = [
  ...ProconnectCenterEmployeeTypeRolesArray,
  ...ProconnectAptrackEmployeeTypeRolesArray,
];

export type ProconnectCenterEmployeeRoleType = Role.CAH | Role.CH | Role.Faculty;

export const UserHasBrandArray = [
  Role.Student,
  ...ProconnectCenterEmployeeTypeRolesArray,
  Role.Moderator,
  Role.DigitalAuditor,
];

/* Modules */

export const PlacementRoles = [
  Role.Student,
  // Role.PlacementSuperAdmin,
  // Role.PlacementAdmin,
  // Role.PlacementUser,
  // Role.CentreAdmin,
  // Role.CentreUser,
  Role.Faculty,
];

export const SocialRoles = [
  Role.Student,
  ...ProconnectCenterEmployeeTypeRolesArray,
  ...ProconnectAptrackEmployeeTypeRolesArray,
];

export const DigitalRoles = [
  Role.Student,
  ...ProconnectCenterEmployeeTypeRolesArray,
  ...ProconnectAptrackEmployeeTypeRolesArray,
];
