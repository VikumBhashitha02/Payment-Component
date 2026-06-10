import Payment from "@/models/Payment";
import Teacher from "@/models/Teacher";
import Student from "@/models/Student";
import ClassModel from "@/models/Class";
import Enrollment from "@/models/Enrollment";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withDB } from "@/lib/api-helpers";
import { MONTHS } from "@/lib/constants";

export async function GET() {
  try {
    const now = new Date();
    const currentMonth = MONTHS[now.getMonth()];
    const currentYear = now.getFullYear();

    return await withDB(async () => {
      const paymentQuery = { year: currentYear };

      const [
        totalStudents,
        totalTeachers,
        totalClasses,
        monthlyPayments,
        allPayments,
        activeEnrollments,
      ] = await Promise.all([
        Student.countDocuments({ status: "active" }),
        Teacher.countDocuments({ status: "active" }),
        ClassModel.countDocuments({ status: "active" }),
        Payment.find({ ...paymentQuery, month: currentMonth }),
        Payment.find(paymentQuery),
        Enrollment.find({ status: "active" }).populate("classId", "teacherId monthlyFee"),
      ]);

      const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
      const ownerIncome = monthlyPayments.reduce((sum, p) => sum + p.ownerShare, 0);
      const teacherPayments = monthlyPayments.reduce((sum, p) => sum + p.teacherShare, 0);

      const paidPairs = new Set(
        monthlyPayments.map((p) => `${p.studentId}-${p.classId}`)
      );
      const pendingPayments = activeEnrollments.filter(
        (e) => !paidPairs.has(`${e.studentId}-${e.classId}`)
      ).length;

      const monthlyRevenueChart = MONTHS.map((month) => ({
        month: month.slice(0, 3),
        revenue: allPayments
          .filter((p) => p.month === month)
          .reduce((sum, p) => sum + p.amount, 0),
      }));

      const teacherEarningsMap = new Map<string, number>();
      for (const payment of allPayments) {
        const tid = payment.teacherId.toString();
        teacherEarningsMap.set(
          tid,
          (teacherEarningsMap.get(tid) || 0) + payment.teacherShare
        );
      }

      const teachers = await Teacher.find().lean();
      const teacherEarningsChart = teachers
        .filter((t) => teacherEarningsMap.has(t._id.toString()))
        .map((t) => ({
          name: t.fullName,
          value: teacherEarningsMap.get(t._id.toString()) || 0,
        }));

      const studentDistribution = await Promise.all(
        teachers.map(async (teacher) => {
          const classIds = await ClassModel.find({ teacherId: teacher._id }).distinct("_id");
          const count = await Enrollment.countDocuments({
            classId: { $in: classIds },
            status: "active",
          });
          return { name: teacher.fullName, value: count };
        })
      );

      const revenueTrend = MONTHS.map((month) => ({
        month: month.slice(0, 3),
        revenue: allPayments
          .filter((p) => p.month === month)
          .reduce((sum, p) => sum + p.amount, 0),
        ownerShare: allPayments
          .filter((p) => p.month === month)
          .reduce((sum, p) => sum + p.ownerShare, 0),
      }));

      return successResponse({
        stats: {
          totalStudents,
          totalTeachers,
          totalClasses,
          monthlyRevenue,
          ownerIncome,
          teacherPayments,
          pendingPayments,
        },
        charts: {
          monthlyRevenue: monthlyRevenueChart,
          teacherEarnings: teacherEarningsChart,
          studentDistribution: studentDistribution.filter((s) => s.value > 0),
          revenueTrend,
        },
      });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch dashboard data";
    return errorResponse(message, 500);
  }
}
