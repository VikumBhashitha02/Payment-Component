"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { classSchema, type ClassFormData } from "@/lib/validations";
import { GRADES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { ClassItem, Teacher } from "@/types";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: { status: "active", grade: "Grade 10" },
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    const [classRes, teacherRes] = await Promise.all([
      fetch(`/api/classes?${params}`),
      fetch("/api/teachers?limit=100"),
    ]);
    const classData = await classRes.json();
    const teacherData = await teacherRes.json();
    if (classData.success) {
      setClasses(classData.data);
      setTotalPages(classData.pagination.totalPages);
      setTotal(classData.pagination.total);
    }
    if (teacherData.success) setTeachers(teacherData.data);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getTeacherName = (teacherId: string | Teacher) =>
    typeof teacherId === "object" ? teacherId.fullName : teachers.find((t) => t._id === teacherId)?.fullName || "—";

  const openCreate = () => {
    setEditingClass(null);
    form.reset({ status: "active", grade: "Grade 10" });
    setDialogOpen(true);
  };

  const openEdit = (classItem: ClassItem) => {
    setEditingClass(classItem);
    const tid = typeof classItem.teacherId === "object" ? classItem.teacherId._id : classItem.teacherId;
    form.reset({
      className: classItem.className,
      grade: classItem.grade as ClassFormData["grade"],
      subject: classItem.subject,
      teacherId: tid,
      monthlyFee: classItem.monthlyFee,
      description: classItem.description || "",
      schedule: classItem.schedule || "",
      status: classItem.status,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: ClassFormData) => {
    const url = editingClass ? `/api/classes/${editingClass._id}` : "/api/classes";
    const res = await fetch(url, {
      method: editingClass ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) {
      toast.success(editingClass ? "Class updated" : "Class created");
      setDialogOpen(false);
      fetchData();
    } else toast.error(result.error);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this class?")) return;
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE" });
    const result = await res.json();
    if (result.success) { toast.success("Class deleted"); fetchData(); }
    else toast.error(result.error);
  };

  return (
    <div>
      <PageHeader title="Classes" description="Manage classes and assignments" action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Class</Button>} />
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search classes..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Monthly Fee</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="font-medium">{c.className}</TableCell>
                    <TableCell>{c.grade}</TableCell>
                    <TableCell>{c.subject}</TableCell>
                    <TableCell>{getTeacherName(c.teacherId)}</TableCell>
                    <TableCell>{formatCurrency(c.monthlyFee)}</TableCell>
                    <TableCell>{c.schedule || "—"}</TableCell>
                    <TableCell><Badge variant={c.status === "active" ? "success" : "secondary"}>{c.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingClass ? "Edit Class" : "Add Class"}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Class Name</Label><Input {...form.register("className")} /></div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <Select value={form.watch("grade")} onValueChange={(v) => form.setValue("grade", v as ClassFormData["grade"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GRADES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Subject</Label><Input {...form.register("subject")} /></div>
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select value={form.watch("teacherId")} onValueChange={(v) => form.setValue("teacherId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>{teachers.map((t) => <SelectItem key={t._id} value={t._id}>{t.fullName} - {t.subject}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Monthly Fee (Rs.)</Label><Input type="number" {...form.register("monthlyFee")} /></div>
              <div className="space-y-2"><Label>Schedule</Label><Input {...form.register("schedule")} placeholder="Mon, Wed 4-6 PM" /></div>
              <div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea {...form.register("description")} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingClass ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
