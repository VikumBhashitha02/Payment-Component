import { NextRequest } from "next/server";
import ClassModel from "@/models/Class";
import { classSchema } from "@/lib/validations";
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
      const classItem = await ClassModel.findById(id)
        .populate("teacherId", "fullName subject email phoneNumber isOwner")
        .lean();
      if (!classItem) return errorResponse("Class not found", 404);
      return successResponse(classItem);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch class";
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
    const parsed = classSchema.partial().safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    return await withDB(async () => {
      const classItem = await ClassModel.findByIdAndUpdate(id, parsed.data, {
        new: true,
        runValidators: true,
      })
        .populate("teacherId", "fullName subject email")
        .lean();
      if (!classItem) return errorResponse("Class not found", 404);
      return successResponse(classItem);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update class";
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
      const classItem = await ClassModel.findByIdAndDelete(id).lean();
      if (!classItem) return errorResponse("Class not found", 404);
      return successResponse({ message: "Class deleted" });
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete class";
    return errorResponse(message, 500);
  }
}
