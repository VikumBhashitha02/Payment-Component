"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Download, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTablePagination } from "@/components/shared/data-table-pagination";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MONTHS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToCSV, exportToPDF } from "@/lib/export";
import type { Payment, Student, Teacher, ClassItem } from "@/types";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (monthFilter) params.set("month", monthFilter);
    if (yearFilter) params.set("year", yearFilter);
    const res = await fetch(`/api/payments?${params}`);
    const data = await res.json();
    if (data.success) {
      setPayments(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    }
    setLoading(false);
  }, [page, search, monthFilter, yearFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const getName = <T extends { fullName?: string; className?: string }>(item: string | T, field: "fullName" | "className" = "fullName") =>
    typeof item === "object" ? (item[field] || "—") : "—";

  const exportData = payments.map((p) => ({
    receiptNumber: p.receiptNumber,
    student: getName(p.studentId as Student),
    teacher: getName(p.teacherId as Teacher),
    class: getName(p.classId as ClassItem, "className"),
    month: p.month,
    amount: p.amount,
    ownerShare: p.ownerShare,
    teacherShare: p.teacherShare,
    paymentDate: formatDate(p.paymentDate),
  }));

  const columns = [
    { key: "receiptNumber" as const, label: "Receipt" },
    { key: "student" as const, label: "Student" },
    { key: "teacher" as const, label: "Teacher" },
    { key: "class" as const, label: "Class" },
    { key: "month" as const, label: "Month" },
    { key: "amount" as const, label: "Amount" },
    { key: "ownerShare" as const, label: "Owner Share" },
    { key: "teacherShare" as const, label: "Teacher Share" },
    { key: "paymentDate" as const, label: "Date" },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Records"
        description="View and manage all payment records"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => exportToCSV(exportData, "payments", columns)}>
              <Download className="mr-2 h-4 w-4" />CSV
            </Button>
            <Button variant="outline" onClick={() => exportToPDF(exportData, "payments", "Payment Records", columns)}>
              <FileText className="mr-2 h-4 w-4" />PDF
            </Button>
            <Button asChild><Link href="/payments/new"><Plus className="mr-2 h-4 w-4" />New Payment</Link></Button>
          </div>
        }
      />
      <div className="mb-4 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search payments..." className="pl-9" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={monthFilter || "all"} onValueChange={(v) => { setMonthFilter(v === "all" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Month" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="number" className="w-full sm:w-28" value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setPage(1); }} placeholder="Year" />
      </div>
      {loading ? <LoadingSpinner /> : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Owner Share</TableHead>
                  <TableHead>Teacher Share</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-mono text-sm">{p.receiptNumber}</TableCell>
                    <TableCell>{getName(p.studentId as Student)}</TableCell>
                    <TableCell>{getName(p.teacherId as Teacher)}</TableCell>
                    <TableCell>{getName(p.classId as ClassItem, "className")}</TableCell>
                    <TableCell>{p.month} {p.year}</TableCell>
                    <TableCell>{formatCurrency(p.amount)}</TableCell>
                    <TableCell>{formatCurrency(p.ownerShare)}</TableCell>
                    <TableCell>{formatCurrency(p.teacherShare)}</TableCell>
                    <TableCell>{formatDate(p.paymentDate)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/payments/${p._id}/receipt`}>Receipt</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination page={page} totalPages={totalPages} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
