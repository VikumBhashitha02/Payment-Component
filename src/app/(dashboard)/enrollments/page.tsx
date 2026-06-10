"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/shared/page-header";
import { StudentSearchSelect } from "@/components/shared/student-search-select";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { enrollmentSchema, type EnrollmentFormData } from "@/lib/validations";
import { ENROLLMENT_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Enrollment, Student, ClassItem } from "@/types";

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      status: "active",
      enrolledDate: new Date().toISOString().split("T")[0],
    },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    const [enrollRes, classRes] = await Promise.all([
      fetch(`/api/enrollments?${params}`),
      fetch("/api/classes?limit=100&status=active"),
    ]);
    const [enrollData, classData] = await Promise.all([
      enrollRes.json(), classRes.json(),
    ]);
    if (enrollData.success) {
      setEnrollments(enrollData.data);
      setTotalPages(enrollData.pagination.totalPages);
      setTotal(enrollData.pagination.total);
    }
    if (classData.success) setClasses(classData.data);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getStudentName = (s: string | Student) =>
    typeof s === "object" ? `${s.fullName} (${s.studentId})` : s;
  const getClassName = (c: string | ClassItem) =>
    typeof c === "object" ? `${c.className} - ${c.subject}` : c;

  const onSubmit = async (data: EnrollmentFormData) => {
    const res = await fetch("/api/enrollments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      toast.success("Student enrolled");
      setDialogOpen(false);
      fetchData();
    } else toast.error(result.error);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this enrollment?")) return;
    const res = await fetch(`/api/enrollments/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) { toast.success("Enrollment removed"); fetchData(); }
    else toast.error(result.error);
  };

  return (
    <div>
      <PageHeader title="Enrollments" description="Manage student class enrollments" action={<Button onClick={() => { form.reset({ status: "active", enrolledDate: new Date().toISOString().split("T")[0] }); setSelectedStudent(null); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Enroll Student</Button>} />

      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by student name, ID, class, or subject..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v) => { setStatusFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {ENROLLMENT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Enrolled Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No enrollments found
                    </TableCell>
                  </TableRow>
                ) : enrollments.map((e) => (
                  <TableRow key={e._id}>
                    <TableCell>{getStudentName(e.studentId)}</TableCell>
                    <TableCell>{getClassName(e.classId)}</TableCell>
                    <TableCell>{formatDate(e.enrolledDate)}</TableCell>
                    <TableCell><Badge variant={e.status === "active" ? "success" : "secondary"}>{e.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(e._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </>
      )}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enroll Student</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Student</Label>
              <StudentSearchSelect
                value={form.watch("studentId")}
                selectedStudent={selectedStudent}
                onValueChange={(id, student) => {
                  form.setValue("studentId", id);
                  setSelectedStudent(student);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={form.watch("classId")} onValueChange={(v) => form.setValue("classId", v)}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map((c) => <SelectItem key={c._id} value={c._id}>{c.className} - {c.subject}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Enrolled Date</Label><Input type="date" {...form.register("enrolledDate")} /></div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as EnrollmentFormData["status"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ENROLLMENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Enroll</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
