// aptrack api endpoints

export const studentFeesEndpoint = (studentDetailId: number) => {
  return `${process.env.APTRACK_API_BASE_URL}/GetStudentFeeDetails/${studentDetailId}`;
};
