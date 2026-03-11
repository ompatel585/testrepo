// import { APPLICATION_NAME } from 'src/common/constants';

import { getAptrack2BrandIdList } from 'src/common/constants';

// const APP_PREFIX = APPLICATION_NAME;

// export const getUserMetadataRedisKey = (userId: string) =>
//   `${APP_PREFIX}:user:metadata:${userId}`;

// export const getUserPGMetadataRedisKey = (userId: string) =>
//   `${APP_PREFIX}:user:pg:metadata:${userId}`;

// export const getEmployeeProfileRedisKey = (userId: string) =>
//   `${APP_PREFIX}:employee:metadata:profile:${userId}`;

// export const getEmployeeBookRedisKey = (userId: string) =>
//   `${APP_PREFIX}:employee:metadata:book:${userId}`;

export const getStudentMetaDataRedisKey = (userId: string) => `StudentMetaData:${userId}`;

export const getFacultyProfileMetaDataRedisKey = (userId: string) =>
  `FacultyMetaData:${userId}`;

export const getFacultyProfileMetaDataAptrack2RedisKey = (userId: string) =>
  `Aptrack2:FacultyMetaData:${userId}`;

export const getStudentMetaDataAptrack2RedisKey = (userId: string) =>
  `Aptrack2:StudentMetaData:${userId}`;

export const getStudentMetaDataRedisKeyFromAptrackByBrandId = (
  aptrackBrandId: number,
  userId: string,
) => {
  if (getAptrack2BrandIdList().includes(aptrackBrandId)) {
    return `Aptrack2:StudentMetaData:${userId}`;
  }
  return `StudentMetaData:${userId}`;
};

export const getFacultyProfileMetaDataRedisKeyFromAptrackByBrandId = (
  aptrackBrandId: number,
  userId: string,
) => {
  if (getAptrack2BrandIdList().includes(aptrackBrandId)) {
    return `Aptrack2:FacultyMetaData:${userId}`;
  }
  return `FacultyMetaData:${userId}`;
};

export const getUserActiveRoleRedisKey = (userId: number) => `userRole:${userId}`;
