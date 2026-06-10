import { NextRequest } from "next/server";
import Payment from "@/models/Payment";
import Teacher from "@/models/Teacher";
import { paymentSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withDB } from "@/lib/api-helpers";
import { requireAuth } from "@/lib/auth-helpers";
import { calculateRevenueSplit } from "@/lib/revenue-sharing";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    return await withDB(async () => {
      const payment = await Payment.findById(id)
        .populate("studentId", "fullName studentId parentName parentPhone")
        .populate("classId", "className subject grade monthlyFee")
        .populate("teacherId", "fullName subject isOwner")
        .lean();
      if (!payment) return errorResponse("Payment not found", 404);
      return successResponse(payment);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch payment";
    return errorResponse(message, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const parsed = paymentSchema.partial().safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    return await withDB(async () => {
      const updateData: Record<string, unknown> = { ...parsed.data };

      if (parsed.data.paymentDate) {
        updateData.paymentDate = new Date(parsed.data.paymentDate);
      }

      if (parsed.data.amount || parsed.data.teacherId) {
        const existing = await Payment.findById(id);
        if (!existing) return errorResponse("Payment not found", 404);

        const teacherId = parsed.data.teacherId || existing.teacherId.toString();
        const amount = parsed.data.amount || existing.amount;
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) return errorResponse("Teacher not found");

        const { ownerShare, teacherShare } = calculateRevenueSplit(
          amount,
          teacher.fullName,
          teacher.isOwner
        );
        updateData.ownerShare = ownerShare;
        updateData.teacherShare = teacherShare;
      }

      const payment = await Payment.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("studentId", "fullName studentId")
        .populate("classId", "className subject")
        .populate("teacherId", "fullName subject")
        .lean();

      if (!payment) return errorResponse("Payment not found", 404);
      return successResponse(payment);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update payment";
    return errorResponse(message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    return await withDB(async () => {
      const payment = await Payment.findByIdAndDelete(id).lean();
      if (!payment) return errorResponse("Payment not found", 404);
      return successResponse({ message: "Payment deleted" });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete payment";
    return errorResponse(message, 500);
  }
}
