import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import Teacher from "@/models/Teacher";
import User from "@/models/User";
import { teacherSchema } from "@/lib/validations";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { withDB, getPaginationParams, buildSearchQuery } from "@/lib/api-helpers";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const { page, limit, search, sortBy, sortOrder, status, skip } =
      getPaginationParams(searchParams);

    return await withDB(async () => {
      const query: Record<string, unknown> = {
        ...buildSearchQuery(search, ["fullName", "subject", "email", "phoneNumber"]),
      };
      if (status) query.status = status;

      const sort: Record<string, 1 | -1> = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      };

      const [teachers, total] = await Promise.all([
        Teacher.find(query).sort(sort).skip(skip).limit(limit).lean(),
        Teacher.countDocuments(query),
      ]);

      return paginatedResponse(teachers, total, page, limit);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch teachers";
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return errorResponse(message, status);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const parsed = teacherSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    return await withDB(async () => {
      const existing = await Teacher.findOne({ email: parsed.data.email });
      if (existing) return errorResponse("Email already exists");

      const teacher = await Teacher.create(parsed.data);

      if (parsed.data.password) {
        const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
        await User.create({
          name: parsed.data.fullName,
          email: parsed.data.email,
          password: hashedPassword,
          role: parsed.data.isOwner ? "admin" : "teacher",
          teacherId: teacher._id,
        });
      }

      return successResponse(teacher, 201);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create teacher";
    return errorResponse(message, 500);
  }
}
