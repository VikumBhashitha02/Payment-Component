export type UserRole = "admin" | "teacher";
export type Status = "active" | "inactive";
export type EnrollmentStatus = "active" | "completed" | "withdrawn";
export type PaymentMethod = "Cash" | "Bank Transfer" | "Card" | "Cheque" | "Online";

export interface Teacher {
  _id: string;
  fullName: string;
  subject: string;
  phoneNumber: string;
  email: string;
  sharePercentage: number;
  isOwner: boolean;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  _id: string;
  studentId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  school: string;
  grade: string;
  parentName: string;
  parentPhone: string;
  address: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface ClassItem {
  _id: string;
  className: string;
  grade: string;
  subject: string;
  teacherId: string | Teacher;
  monthlyFee: number;
  description?: string;
  schedule?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  _id: string;
  studentId: string | Student;
  classId: string | ClassItem;
  enrolledDate: string;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  receiptNumber: string;
  studentId: string | Student;
  classId: string | ClassItem;
  teacherId: string | Teacher;
  month: string;
  year: number;
  amount: number;
  ownerShare: number;
  teacherShare: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  monthlyRevenue: number;
  ownerIncome: number;
  teacherPayments: number;
  pendingPayments: number;
}

export interface TeacherReport {
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  totalCollection: number;
  totalTeacherEarnings: number;
  totalOwnerCommission: number;
  payments: Payment[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
}
