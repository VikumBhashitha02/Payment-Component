import { NextRequest } from "next/server";
import Student from "@/models/Student";
import { studentSchema } from "@/lib/validations";
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
      const student = await Student.findById(id).lean();
      if (!student) return errorResponse("Student not found", 404);
      return successResponse(student);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch student";
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
    const parsed = studentSchema.partial().safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    return await withDB(async () => {
      const updateData = { ...parsed.data };
      if (parsed.data.dateOfBirth) {
        updateData.dateOfBirth = new Date(parsed.data.dateOfBirth) as unknown as string;
      }

      const student = await Student.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).lean();
      if (!student) return errorResponse("Student not found", 404);
      return successResponse(student);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update student";
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
      const student = await Student.findByIdAndDelete(id).lean();
      if (!student) return errorResponse("Student not found", 404);
      return successResponse({ message: "Student deleted" });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete student";
    return errorResponse(message, 500);
  }
}
