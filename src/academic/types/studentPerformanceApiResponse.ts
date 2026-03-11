export interface IPerformanceAPIResp {
  courseName: string;
  termName: string;
  totalMarks: number;
  weightage: number;
  examDate: string;
  examTotal: number;
  examTypeName: string;
  remarks: string;
}

export interface IExam {
  totalMarks: number;
  weightage: number;
  examDate: string;
  examTotal: number;
  examTypeName: string;
  remarks: string;
}

export interface ITermPerformance {
  termName: string;
  exams: IExam[];
}
