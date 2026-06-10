"use client";

import { SearchableCombobox } from "@/components/shared/searchable-combobox";
import type { Student } from "@/types";

interface StudentSearchSelectProps {
  value?: string;
  onValueChange: (studentId: string, student: Student) => void;
  selectedStudent?: Student | null;
  disabled?: boolean;
}

async function searchStudents(query: string): Promise<Student[]> {
  const params = new URLSearchParams({
    status: "active",
    limit: "25",
    sortBy: "fullName",
    sortOrder: "asc",
  });
  if (query.trim()) {
    params.set("search", query.trim());
  }

  const res = await fetch(`/api/students?${params}`);
  const data = await res.json();
  return data.success ? data.data : [];
}

export function StudentSearchSelect({
  value,
  onValueChange,
  selectedStudent,
  disabled,
}: StudentSearchSelectProps) {
  return (
    <SearchableCombobox<Student>
      value={value}
      onValueChange={onValueChange}
      selectedItem={selectedStudent}
      disabled={disabled}
      placeholder="Search student by name or ID..."
      searchPlaceholder="Type name, ID, grade, or parent phone..."
      emptyMessage="No students found. Try a different search."
      fetchOptions={searchStudents}
      getOptionValue={(s) => s._id}
      getOptionLabel={(s) => `${s.fullName} (${s.studentId})`}
      renderOption={(s) => (
        <div>
          <p className="font-medium">{s.fullName}</p>
          <p className="text-xs text-muted-foreground">
            {s.studentId} · {s.grade} · {s.parentPhone}
          </p>
        </div>
      )}
    />
  );
}
