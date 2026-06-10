import { NextRequest } from "next/server";
import Teacher from "@/models/Teacher";
import { teacherSchema } from "@/lib/validations";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withDB } from "@/lib/api-helpers";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    return await withDB(async () => {
      const teacher = await Teacher.findById(id).lean();
      if (!teacher) return errorResponse("Teacher not found", 404);
      return successResponse(teacher);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch teacher";
    return errorResponse(message, 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const parsed = teacherSchema.partial().safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    return await withDB(async () => {
      const teacher = await Teacher.findByIdAndUpdate(id, parsed.data, {
        new: true,
        runValidators: true,
      }).lean();
      if (!teacher) return errorResponse("Teacher not found", 404);
      return successResponse(teacher);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update teacher";
    return errorResponse(message, 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    return await withDB(async () => {
      const teacher = await Teacher.findByIdAndDelete(id).lean();
      if (!teacher) return errorResponse("Teacher not found", 404);
      return successResponse({ message: "Teacher deleted" });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete teacher";
    return errorResponse(message, 500);
  }
}
