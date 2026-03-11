import { Profile } from '../entities/profile.entity';
import {
  IAptrack2EmployeeMetaData,
  IAptrackEmployeeMetaData,
  IStudentMetaData,
  SubBrands,
} from '../entities/user-metadata.entity';
import { User } from '../entities/user.entity';
import {
  IAttendanceMetaDataMap,
  IBooksMetaDataMap,
  ICertificatesMetaDataMap,
  ICoursesMetaDataMap,
  IEmployeeBooksMetaDataMap,
  IMarksMetaDataMap,
} from '../interfaces/userMetaData.interface';

export function attendanceMetaDataMap(
  userMetaData: IStudentMetaData,
): IAttendanceMetaDataMap[] {
  let attendance: IAttendanceMetaDataMap[] = [];

  for (const BC of userMetaData.BC) {
    for (const course of BC.Courses) {
      const singleCourse: IAttendanceMetaDataMap = {
        id: course.CourseId,
        name: course.CourseName,
        description: '',
        totalSession: course.TotalSession,
        sessionAttend: course.SessionAttend,
        attendancePercent: course.AttendacePercentage,
        terms: [],
      };

      for (const term of course.Terms) {
        const singleTerm = {
          id: term.TermId,
          name: term.TermName,
          totalSession: term.TotalSession,
          sessionAttend: term.SessionAttended,
          attendancePercent: term.AttendacePercentage,
        };

        singleCourse.terms.push(singleTerm);
      }
      attendance.push(singleCourse);
    }
  }

  return attendance;
}

export function marksMetaDataMap(userMetaData: IStudentMetaData): IMarksMetaDataMap[] {
  let marks: IMarksMetaDataMap[] = [];

  for (const BC of userMetaData.BC) {
    for (const course of BC.Courses) {
      const singleCourse: IMarksMetaDataMap = {
        id: course.CourseId,
        name: course.CourseName,
        description: '',
        MarksCategory: course.MarksCategory,
        MAACNonIPVADGrade: course.MAACNonIPVADGrade,
        LAPAMarks: course.LAPAMarks,
        terms: [],
      };

      for (const term of course.Terms) {
        const singleTerm = {
          id: term.TermId,
          name: term.TermName,
          marks: [],
        };

        for (const mark of term.Marks) {
          const singleMark = {
            id: 1,
            name: mark.ComponentName,
            totalMarks: mark.TotalMarks,
            obtainedMarks: mark.ObtainedMarks,
            weightAge: Math.floor((mark.ObtainedMarks / mark.TotalMarks) * 100),
          };

          singleTerm.marks.push(singleMark);
        }

        singleCourse.terms.push(singleTerm);
      }
      marks.push(singleCourse);
    }
  }

  return marks;
}

export function coursesMetaDataMap(
  userMetaData: IStudentMetaData,
): ICoursesMetaDataMap[] {
  let courses: ICoursesMetaDataMap[] = [];

  for (const BC of userMetaData.BC) {
    for (const course of BC.Courses) {
      const singleCourse: ICoursesMetaDataMap = {
        id: course.CourseId,
        name: course.CourseName,
        description: '',
        completion: course.AttendacePercentage,
      };
      courses.push(singleCourse);
    }
  }

  return courses;
}

export function bookIdMetaDataMap(userMetaData: IStudentMetaData): number[] {
  let bookIds: number[] = [];

  for (const BC of userMetaData.BC) {
    for (const course of BC.Courses) {
      for (const term of course.Terms) {
        for (const module of term.Modules) {
          for (const book of module.Books) {
            bookIds.push(book.BookId);
          }
        }
      }
    }
  }

  return bookIds;
}

export function booksMetaDataMap(
  userMetaData: IStudentMetaData,
  bookIdMap: Map<number, number>,
): IBooksMetaDataMap[] {
  let books: IBooksMetaDataMap[] = [];
  for (const BC of userMetaData.BC) {
    for (const course of BC.Courses) {
      const singleCourse: IBooksMetaDataMap = {
        id: course.CourseId,
        name: course.CourseName,
        description: '',
        terms: [],
      };

      for (const term of course.Terms) {
        const singleTerm: IBooksMetaDataMap['terms'][number] = {
          id: term.TermId,
          name: term.TermName,
          books: [],
        };
        for (const module of term.Modules) {
          for (const book of module.Books) {
            if (!bookIdMap.get(book.BookId)) {
              continue;
            }
            const singleBook: IBooksMetaDataMap['terms'][number]['books'][number] = {
              id: bookIdMap.get(book.BookId),
              aptrack_1_book_id: book.BookId,
              title: book.BookName,
              thumbnail: null,
              courseId: course.CourseId,
              termId: term.TermId,
            };

            singleTerm.books.push(singleBook);
          }
        }

        singleCourse.terms.push(singleTerm);
      }

      books.push(singleCourse);
    }
  }

  return books;
}

export function certificatesMetaDataMap(
  userMetaData: IStudentMetaData,
): ICertificatesMetaDataMap[] {
  let certificates: ICertificatesMetaDataMap[] = [];

  for (const BC of userMetaData.BC) {
    for (const course of BC.Courses) {
      const singleCourse: ICertificatesMetaDataMap = {
        id: course.CourseId,
        name: course.CourseName,
        description: '',
        certificateSerialNo: course.CertSerialNo,
        certificateName: course.CertName,
        lapaePSSerialNo: course.LAPAePSSerialNo,
        lapaePSName: course.LAPAePSName,
        url: null,
        terms: [],
      };

      for (const term of course.Terms) {
        if (!term.PSName) {
          continue;
        }
        const singleTerm = {
          id: term.TermId,
          name: term.TermName,
          certificateSerialNo: term.PSSerialNo,
          certificateName: term.PSName,
          url: null,
        };

        singleCourse.terms.push(singleTerm);
      }
      certificates.push(singleCourse);
    }
  }

  return certificates;
}

// ----------------------------------------------------

export function employeeBookIdMetaDataMap(
  userMetaData: IAptrackEmployeeMetaData,
): number[] {
  let bookIds: number[] = [];

  for (const book of userMetaData.Books) {
    bookIds.push(book.BookId);
  }
  return bookIds;
}

export function employeeBooksMetaDataMap(
  userMetaData: IAptrack2EmployeeMetaData,
  bookIdMap: Map<number, number>,
): IEmployeeBooksMetaDataMap[] {
  let books: IEmployeeBooksMetaDataMap[] = [];

  for (const book of userMetaData.Books) {
    if (!bookIdMap.get(book.BookId)) {
      continue;
    }
    const singleBook: IEmployeeBooksMetaDataMap = {
      id: bookIdMap.get(book.BookId),
      aptrack_1_book_id: book.BookId,
      title: book.BookName,
      bookDescription: book.BookDescription || '',
      thumbnail: null,
    };

    books.push(singleBook);
  }

  return books;
}

export function studentSubBrandKeyArray(userMetaData: IStudentMetaData): number[] {
  let studentSubBrandKeyArray = [];
  for (const BC of userMetaData.BC) {
    for (const course of BC.Courses) {
      studentSubBrandKeyArray.push(course.ACC1BrandID);
    }
  }

  return [...new Set(studentSubBrandKeyArray)];
}

export function AptrackEmployeeSubBrandKeyArray(subBrands: SubBrands[]): number[] {
  let employeeSubBrandKeyArray = [];
  for (const subBrand of subBrands) {
    employeeSubBrandKeyArray.push(subBrand.ACC1BrandID);
  }

  return [...new Set(employeeSubBrandKeyArray)];
}

export function studentHastDoSelectCourse(userMetaData: IStudentMetaData): boolean {
  for (const BC of userMetaData.BC) {
    for (const course of BC.Courses) {
      if (course.isDoSelect) {
        return true;
      }
    }
  }

  return false;
}

export function formatAptrack1CEMetaDataIntoAptrack1(
  ap1: IAptrackEmployeeMetaData,
): IAptrackEmployeeMetaData {
  const centerIds = ap1?.centerIds || [ap1.CenterDetails.CentreId];
  ap1.centerIds = centerIds;

  return ap1;
}

function getAllCenterIdOfAptrack2(ap2: any) {
  const centreIds = [];
  for (const brand of ap2.brandIds) {
    for (const roleCenter of brand?.RoleCentre) {
      for (const center of roleCenter?.CentreDetails) {
        centreIds.push(center.CentreId);
      }
    }
  }

  return [...new Set(centreIds)];
}

export function formatAptrack2CEMetaDataIntoAptrack1(ap2: any): IAptrackEmployeeMetaData {
  const ap2Obj = Array.isArray(ap2) ? ap2[0] : ap2;
  const firstBrandObj = ap2Obj?.brandIds?.[0];
  const firstRoleCentre = firstBrandObj?.RoleCentre?.[0];
  const firstCentreDetails = firstRoleCentre?.CentreDetails?.[0];
  const allCenterId = getAllCenterIdOfAptrack2(ap2Obj);

  return {
    userType: ap2Obj.userType ?? 'CE',
    userId: ap2Obj.userId,
    firstName: ap2Obj.firstName,
    middleName: ap2Obj.middleName,
    lastName: ap2Obj.lastName,
    dob: ap2Obj.dob,
    mobile: ap2Obj.mobile,
    email: ap2Obj.email,
    address: ap2Obj.address,
    country: ap2Obj.country,
    state: ap2Obj.state,
    city: ap2Obj.city,
    pinCode: ap2Obj.pinCode,

    // Extracted from brandIds[0]
    brandId: firstBrandObj ? firstBrandObj.BrandId : null,

    // brandIds (Aptrack1 expects number[]) → pick BrandId from objects
    brandIds: ap2Obj.brandIds,

    // CenterId from the first centre details
    centerId: firstCentreDetails?.CentreId ?? 0,
    centerIds: allCenterId,

    isDomestic: ap2Obj.isDomestic ?? false,
    UniversityCode: ap2Obj.UniversityCode,

    // Direct mapping (already provided in aptrack2)
    SubBrands: ap2Obj?.SubBrands ?? [],

    // Roles extracted from RoleCentre[]
    Role:
      ap2Obj?.brandIds
        ?.flatMap((brand: any) => brand?.RoleCentre || [])
        .map((rc: any) => rc?.Role)
        .filter(Boolean) ?? [],

    // Direct mapping
    Books: ap2Obj?.Book ?? [],

    // Construct CenterDetails (Aptrack1 format)
    CenterDetails: firstCentreDetails
      ? {
          BrandId: firstCentreDetails.BrandId,
          BrandCode: firstCentreDetails.BrandCode,
          Zone: firstCentreDetails.Zone,
          Region: firstCentreDetails.Region,
          Area: firstCentreDetails.Area,
          CentreId: firstCentreDetails.CentreId,
          CentreName: firstCentreDetails.CentreName,
          CNCCode: firstCentreDetails.CNCCode,
          SAPCode: firstCentreDetails.SAPCode,
          StateName: firstCentreDetails.StateName,
          CityName: firstCentreDetails.CityName,
        }
      : null,
    // Direct mapping (exists in Aptrack2)
    TopAccess: ap2Obj?.TopAccess ?? null,
  };
}

//----------------------admin--------------

export function buildCourseWiseBooksAndCert(
  studentMetaData: IStudentMetaData,
  brandKey: number,
): any[] {
  const courseWiseBooksAndCert: any[] = [];

  for (const BC of studentMetaData.BC) {
    for (const course of BC.Courses) {
      for (const term of course.Terms) {
        let epsCount = 0;
        if (brandKey == 111) {
          epsCount = course.LAPAePSSerialNo ? 1 : 0;
        } else {
          epsCount = course.Terms.filter((t) => t.PSSerialNo).length;
        }

        const certCount = course.CertSerialNo ? 1 : 0;

        // find or create course entry
        let courseEntry = courseWiseBooksAndCert.find(
          (c) => c.courseId === course.CourseId,
        );

        if (!courseEntry) {
          courseEntry = {
            courseId: course.CourseId,
            courseName: course.CourseName,
            epsCount,
            certCount,
            books: [],
          };
          courseWiseBooksAndCert.push(courseEntry);
        }

        // add books under this course
        for (const module of term.Modules) {
          for (const book of module.Books) {
            if (!courseEntry.books.find((b) => b.aptrack_1_book_id === book.BookId)) {
              courseEntry.books.push({
                aptrack_1_book_id: book.BookId,
                bookName: book.BookName,
              });
            }
          }
        }
      }
    }
  }

  return courseWiseBooksAndCert;
}

export function getStudentBcList(studentMetaData: IStudentMetaData) {
  const bcList: any[] = [];

  for (const BC of studentMetaData.BC) {
    bcList.push(BC.BCNo);
  }

  return bcList;
}
