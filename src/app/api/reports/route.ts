import { NextRequest } from "next/server";
import Payment from "@/models/Payment";
import Teacher from "@/models/Teacher";
import Enrollment from "@/models/Enrollment";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withDB } from "@/lib/api-helpers";
import { MONTHS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "teacher";
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10);

    return await withDB(async () => {
      if (type === "teacher") {
        const teachers = await Teacher.find().lean();
        const reports = await Promise.all(
          teachers.map(async (teacher) => {
            const payments = await Payment.find({ teacherId: teacher._id, year })
              .populate("studentId", "fullName studentId")
              .populate("classId", "className subject")
              .sort({ paymentDate: -1 })
              .lean();

            const classIds = [...new Set(payments.map((p) => p.classId?.toString()))];
            const enrollments = await Enrollment.find({
              classId: { $in: classIds },
              status: "active",
            }).lean();

            const studentIds = new Set(enrollments.map((e) => e.studentId.toString()));

            return {
              teacherId: teacher._id.toString(),
              teacherName: teacher.fullName,
              totalStudents: studentIds.size,
              totalCollection: payments.reduce((sum, p) => sum + p.amount, 0),
              totalTeacherEarnings: payments.reduce((sum, p) => sum + p.teacherShare, 0),
              totalOwnerCommission: payments.reduce((sum, p) => sum + p.ownerShare, 0),
              payments,
            };
          })
        );

        return successResponse(reports);
      }

      if (type === "owner") {
        const payments = await Payment.find({ year })
          .populate("teacherId", "fullName isOwner")
          .lean();

        const teacherMap = new Map<
          string,
          {
            teacherName: string;
            totalCollection: number;
            ownerCommission: number;
            teacherEarnings: number;
            monthly: Record<string, number>;
          }
        >();

        for (const payment of payments) {
          const teacher = payment.teacherId as { _id?: { toString: () => string }; fullName?: string } | null;
          const teacherId = teacher?._id?.toString() || "unknown";
          const teacherName = teacher?.fullName || "Unknown";

          if (!teacherMap.has(teacherId)) {
            teacherMap.set(teacherId, {
              teacherName,
              totalCollection: 0,
              ownerCommission: 0,
              teacherEarnings: 0,
              monthly: Object.fromEntries(MONTHS.map((m) => [m, 0])),
            });
          }

          const entry = teacherMap.get(teacherId)!;
          entry.totalCollection += payment.amount;
          entry.ownerCommission += payment.ownerShare;
          entry.teacherEarnings += payment.teacherShare;
          if (payment.month) {
            entry.monthly[payment.month] = (entry.monthly[payment.month] || 0) + payment.ownerShare;
          }
        }

        const yearlyTotal = payments.reduce((sum, p) => sum + p.ownerShare, 0);
        const monthlyBreakdown = MONTHS.map((month) => ({
          month,
          amount: payments
            .filter((p) => p.month === month)
            .reduce((sum, p) => sum + p.ownerShare, 0),
        }));

        return successResponse({
          teachers: Array.from(teacherMap.values()),
          yearlyTotal,
          monthlyBreakdown,
        });
      }

      return errorResponse("Invalid report type");
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate report";
    return errorResponse(message, 500);
  }
}
