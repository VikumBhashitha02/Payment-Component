import { NextRequest } from "next/server";
import Student from "@/models/Student";
import { studentSchema } from "@/lib/validations";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { withDB, getPaginationParams, buildSearchQuery } from "@/lib/api-helpers";
import { requireAuth } from "@/lib/auth-helpers";
import { generateStudentId } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, search, sortBy, sortOrder, status, skip } =
      getPaginationParams(searchParams);

    return await withDB(async () => {
      const query: Record<string, unknown> = {
        ...buildSearchQuery(search, [
          "fullName",
          "studentId",
          "school",
          "grade",
          "parentName",
          "parentPhone",
        ]),
      };
      if (status) query.status = status;

      const sort: Record<string, 1 | -1> = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      };

      const [students, total] = await Promise.all([
        Student.find(query).sort(sort).skip(skip).limit(limit).lean(),
        Student.countDocuments(query),
      ]);

      return paginatedResponse(students, total, page, limit);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch students";
    const status = message === "Unauthorized" ? 401 : 500;
    return errorResponse(message, status);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const parsed = studentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    return await withDB(async () => {
      const count = await Student.countDocuments();
      const student = await Student.create({
        ...parsed.data,
        studentId: generateStudentId(count),
        dateOfBirth: new Date(parsed.data.dateOfBirth),
      });
      return successResponse(student, 201);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create student";
    return errorResponse(message, 500);
  }
}
