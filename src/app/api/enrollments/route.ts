import { NextRequest } from "next/server";
import Enrollment from "@/models/Enrollment";
import Student from "@/models/Student";
import ClassModel from "@/models/Class";
import { enrollmentSchema } from "@/lib/validations";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { withDB, getPaginationParams, buildSearchQuery } from "@/lib/api-helpers";
import { requireAuth } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const { page, limit, search, sortBy, sortOrder, status, skip } =
      getPaginationParams(searchParams);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");

    return await withDB(async () => {
      const query: Record<string, unknown> = {};
      if (status) query.status = status;
      if (studentId) query.studentId = studentId;
      if (classId) query.classId = classId;

      if (search) {
        const [matchingStudents, matchingClasses] = await Promise.all([
          Student.find(
            buildSearchQuery(search, ["fullName", "studentId", "grade", "parentName", "parentPhone"])
          ).distinct("_id"),
          ClassModel.find(
            buildSearchQuery(search, ["className", "subject", "grade"])
          ).distinct("_id"),
        ]);

        if (matchingStudents.length === 0 && matchingClasses.length === 0) {
          return paginatedResponse([], 0, page, limit);
        }

        query.$or = [
          ...(matchingStudents.length > 0 ? [{ studentId: { $in: matchingStudents } }] : []),
          ...(matchingClasses.length > 0 ? [{ classId: { $in: matchingClasses } }] : []),
        ];
      }

      const sort: Record<string, 1 | -1> = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      };

      const [enrollments, total] = await Promise.all([
        Enrollment.find(query)
          .populate("studentId", "fullName studentId grade")
          .populate({
            path: "classId",
            populate: { path: "teacherId", select: "fullName subject" },
          })
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Enrollment.countDocuments(query),
      ]);

      return paginatedResponse(enrollments, total, page, limit);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch enrollments";
    return errorResponse(message, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const parsed = enrollmentSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }

    return await withDB(async () => {
      const existing = await Enrollment.findOne({
        studentId: parsed.data.studentId,
        classId: parsed.data.classId,
      });
      if (existing) return errorResponse("Student already enrolled in this class");

      const enrollment = await Enrollment.create({
        ...parsed.data,
        enrolledDate: new Date(parsed.data.enrolledDate),
      });

      const populated = await Enrollment.findById(enrollment._id)
        .populate("studentId", "fullName studentId grade")
        .populate("classId", "className subject grade")
        .lean();

      return successResponse(populated, 201);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create enrollment";
    return errorResponse(message, 500);
  }
}
