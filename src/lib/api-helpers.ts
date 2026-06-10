import { connectDB } from "@/lib/mongodb";

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
  const status = searchParams.get("status") || "";
  const skip = (page - 1) * limit;

  return { page, limit, search, sortBy, sortOrder, status, skip };
}

export function buildSearchQuery(search: string, fields: string[]) {
  if (!search) return {};
  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    })),
  };
}

export async function withDB<T>(fn: () => Promise<T>): Promise<T> {
  await connectDB();
  return fn();
}
