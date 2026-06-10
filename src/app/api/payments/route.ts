import { NextRequest } from "next/server";
import Payment from "@/models/Payment";
import Teacher from "@/models/Teacher";
import { paymentSchema } from "@/lib/validations";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { withDB, getPaginationParams } from "@/lib/api-helpers";
import { requireAuth } from "@/lib/auth-helpers";
import { calculateRevenueSplit } from "@/lib/revenue-sharing";
import { generateReceiptNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search, sortBy, sortOrder, skip } =
      getPaginationParams(searchParams);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const teacherId = searchParams.get("teacherId");

    return await withDB(async () => {
      const query: Record<string, unknown> = {};

      if (teacherId) {
        query.teacherId = teacherId;
      }

      if (month) query.month = month;
      if (year) query.year = parseInt(year, 10);

      const sort: Record<string, 1 | -1> = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      };

      let payments = await Payment.find(query)
        .populate("studentId", "fullName studentId")
        .populate("classId", "className subject grade")
        .populate("teacherId", "fullName subject isOwner")
        .sort(sort)
        .lean();

      if (search) {
        const searchLower = search.toLowerCase();
        payments = payments.filter((p) => {
          const student = p.studentId as { fullName?: string; studentId?: string } | null;
          const teacher = p.teacherId as { fullName?: string } | null;
          const classItem = p.classId as { className?: string } | null;
          return (
            p.receiptNumber?.toLowerCase().includes(searchLower) ||
            student?.fullName?.toLowerCase().includes(searchLower) ||
            teacher?.fullName?.toLowerCase().includes(searchLower) ||
            classItem?.className?.toLowerCase().includes(searchLower)
          );
        });
      }

      const total = payments.length;
      const paginated = payments.slice(skip, skip + limit);

      return paginatedResponse(paginated, total, page, limit);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch payments";
    return errorResponse(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    return await withDB(async () => {
      const teacher = await Teacher.findById(parsed.data.teacherId);
      if (!teacher) return errorResponse("Teacher not found");

      const { ownerShare, teacherShare } = calculateRevenueSplit(
        parsed.data.amount,
        teacher.fullName,
        teacher.isOwner
      );

      const payment = await Payment.create({
        ...parsed.data,
        receiptNumber: parsed.data.receiptNumber || generateReceiptNumber(),
        ownerShare,
        teacherShare,
        paymentDate: new Date(parsed.data.paymentDate),
      });

      const populated = await Payment.findById(payment._id)
        .populate("studentId", "fullName studentId")
        .populate("classId", "className subject grade")
        .populate("teacherId", "fullName subject isOwner")
        .lean();

      return successResponse(populated, 201);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create payment";
    return errorResponse(message, 500);
  }
}
