import { z } from "zod";
import { ENROLLMENT_STATUSES, GENDERS, GRADES, PAYMENT_METHODS, STATUSES } from "@/lib/constants";

export const teacherSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  subject: z.string().min(2, "Subject is required"),
  phoneNumber: z.string().min(10, "Valid phone number required"),
  email: z.string().email("Valid email required"),
  sharePercentage: z.coerce.number().min(0).max(100).default(80),
  isOwner: z.boolean().default(false),
  status: z.enum(STATUSES).default("active"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const studentSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(GENDERS),
  school: z.string().min(2, "School is required"),
  grade: z.enum(GRADES),
  parentName: z.string().min(2, "Parent name is required"),
  parentPhone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(5, "Address is required"),
  status: z.enum(STATUSES).default("active"),
});

export const classSchema = z.object({
  className: z.string().min(2, "Class name is required"),
  grade: z.enum(GRADES),
  subject: z.string().min(2, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  monthlyFee: z.coerce.number().min(0, "Fee must be positive"),
  description: z.string().optional(),
  schedule: z.string().optional(),
  status: z.enum(STATUSES).default("active"),
});

export const enrollmentSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  classId: z.string().min(1, "Class is required"),
  enrolledDate: z.string().min(1, "Enrollment date is required"),
  status: z.enum(ENROLLMENT_STATUSES).default("active"),
});

export const paymentSchema = z.object({
  receiptNumber: z.string().optional(),
  studentId: z.string().min(1, "Student is required"),
  classId: z.string().min(1, "Class is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  month: z.string().min(1, "Month is required"),
  year: z.coerce.number().min(2020).max(2100),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentDate: z.string().min(1, "Payment date is required"),
  remarks: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;
export type StudentFormData = z.infer<typeof studentSchema>;
export type ClassFormData = z.infer<typeof classSchema>;
export type EnrollmentFormData = z.infer<typeof enrollmentSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
