import { OWNER_NAME } from "./constants";

export interface RevenueSplit {
  ownerShare: number;
  teacherShare: number;
}

export function calculateRevenueSplit(
  amount: number,
  teacherName: string,
  isOwnerTeacher = false
): RevenueSplit {
  if (isOwnerTeacher || teacherName.toLowerCase() === OWNER_NAME.toLowerCase()) {
    return {
      ownerShare: amount,
      teacherShare: amount,
    };
  }

  return {
    ownerShare: Math.round(amount * 0.2 * 100) / 100,
    teacherShare: Math.round(amount * 0.8 * 100) / 100,
  };
}
