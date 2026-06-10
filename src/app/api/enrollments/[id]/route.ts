import { NextRequest } from "next/server";
import Enrollment from "@/models/Enrollment";
import { enrollmentSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withDB } from "@/lib/api-helpers";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    return await withDB(async () => {
      const enrollment = await Enrollment.findById(id)
        .populate("studentId", "fullName studentId grade parentName parentPhone")
        .populate({
          path: "classId",
          populate: { path: "teacherId", select: "fullName subject" },
        })
        .lean();
      if (!enrollment) return errorResponse("Enrollment not found", 404);
      return successResponse(enrollment);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch enrollment";
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
    const parsed = enrollmentSchema.partial().safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    return await withDB(async () => {
      const updateData = { ...parsed.data };
      if (parsed.data.enrolledDate) {
        updateData.enrolledDate = new Date(parsed.data.enrolledDate) as unknown as string;
      }

      const enrollment = await Enrollment.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate("studentId", "fullName studentId")
        .populate("classId", "className subject")
        .lean();
      if (!enrollment) return errorResponse("Enrollment not found", 404);
      return successResponse(enrollment);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update enrollment";
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
      const enrollment = await Enrollment.findByIdAndDelete(id).lean();
      if (!enrollment) return errorResponse("Enrollment not found", 404);
      return successResponse({ message: "Enrollment removed" });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete enrollment";
    return errorResponse(message, 500);
  }
}
