import { Role } from './role.enum';

export enum AptrackRole {
  Faculty = 'FAC', // Faculty
  AVFaculty = 'AV-Faculty', // AV-Faculty
  ArenaFaculty = 'ARENA-FACULTY', // ARENA-FACULTY
  BSCLanguageFaculty = 'BSC Language Faculty', // BSC Language Faculty
  TVPAFaculty = 'TVPA-Faculty', // Faculty marks
  CH = 'CH', // Center Head
  CAH = 'CAH', // Center Academic Head
  PE = 'PE', // Placement Executive
  ST = 'ST', // Student
  PM = 'PM', // Placement Manager
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

const AptrackFaculties = [
  AptrackRole.Faculty,
  AptrackRole.AVFaculty,
  AptrackRole.ArenaFaculty,
  AptrackRole.BSCLanguageFaculty,
  AptrackRole.TVPAFaculty,
];

export const AptrackCentreEmployeeRoles = [
  AptrackRole.CH,
  AptrackRole.CAH,
  ...AptrackFaculties,
];

export const AptrackProconnectIntegratedRoles: Record<AptrackRole, Role> = {
  [AptrackRole.Faculty]: Role.Faculty,
  [AptrackRole.AVFaculty]: Role.Faculty,
  [AptrackRole.ArenaFaculty]: Role.Faculty,
  [AptrackRole.BSCLanguageFaculty]: Role.Faculty,
  [AptrackRole.TVPAFaculty]: Role.Faculty,
  [AptrackRole.CH]: Role.CH,
  [AptrackRole.CAH]: Role.CAH,
  [AptrackRole.PM]: Role.PM,
  [AptrackRole.PE]: Role.PE,
  [AptrackRole.ST]: Role.Student,
  // [AptrackRole.PM]: Role.PlacementSuperAdmin,
  [AptrackRole.RAH]: Role.RAH,
  [AptrackRole.ZAH]: Role.ZAH,
  [AptrackRole.NAH]: Role.NAH,
  [AptrackRole.NPH]: Role.NPH,

  [AptrackRole.APNAM]: Role.APNAM,
  [AptrackRole.ASH]: Role.ASH,
  [AptrackRole.CoH]: Role.CoH,
  [AptrackRole.CCE]: Role.CCE,
  [AptrackRole.CCH]: Role.CCH,
  [AptrackRole.LAPARAH]: Role.LAPARAH,
  [AptrackRole.M_EX]: Role.M_EX,
  [AptrackRole.NOH]: Role.NOH,
  [AptrackRole.NSH]: Role.NSH,
  [AptrackRole.OE]: Role.OE,
  [AptrackRole.OM]: Role.OM,
  [AptrackRole.P1]: Role.P1,
  [AptrackRole.PSH]: Role.PSH,
  [AptrackRole.RSH]: Role.RSH,
  [AptrackRole.ZSH]: Role.ZSH,
};

export const filterOutProconnectEquivalentRoles = (roles: AptrackRole[]): Role[] => {
  const roleSet = roles.reduce((set: Set<Role>, currentRole: AptrackRole) => {
    const role = AptrackProconnectIntegratedRoles[currentRole];
    if (role) {
      set.add(role);
    }
    return set;
  }, new Set<Role>());

  return Array.from(roleSet);
};
