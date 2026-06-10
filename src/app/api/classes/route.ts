import { NextRequest } from "next/server";
import ClassModel from "@/models/Class";
import { classSchema } from "@/lib/validations";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { withDB, getPaginationParams, buildSearchQuery } from "@/lib/api-helpers";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search, sortBy, sortOrder, status, skip } =
      getPaginationParams(searchParams);

    return await withDB(async () => {
      const query: Record<string, unknown> = {
        ...buildSearchQuery(search, ["className", "subject", "grade"]),
      };
      if (status) query.status = status;

      const sort: Record<string, 1 | -1> = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      };

      const [classes, total] = await Promise.all([
        ClassModel.find(query)
          .populate("teacherId", "fullName subject email")
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        ClassModel.countDocuments(query),
      ]);

      return paginatedResponse(classes, total, page, limit);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch classes";
    return errorResponse(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = classSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    return await withDB(async () => {
      const classItem = await ClassModel.create(parsed.data);
      const populated = await ClassModel.findById(classItem._id)
        .populate("teacherId", "fullName subject email")
        .lean();
      return successResponse(populated, 201);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create class";
    return errorResponse(message, 500);
  }
}
