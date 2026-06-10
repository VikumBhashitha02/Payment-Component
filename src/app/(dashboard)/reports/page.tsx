"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { TeacherReport, Payment, Student, ClassItem } from "@/types";

interface OwnerReport {
  teachers: {
    teacherName: string;
    totalCollection: number;
    ownerCommission: number;
    teacherEarnings: number;
    monthly: Record<string, number>;
  }[];
  yearlyTotal: number;
  monthlyBreakdown: { month: string; amount: number }[];
}

export default function ReportsPage() {
  const [teacherReports, setTeacherReports] = useState<TeacherReport[]>([]);
  const [ownerReport, setOwnerReport] = useState<OwnerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/reports?type=teacher&year=${year}`).then((r) => r.json()),
      fetch(`/api/reports?type=owner&year=${year}`).then((r) => r.json()),
    ]).then(([teacherData, ownerData]) => {
      if (teacherData.success) setTeacherReports(teacherData.data);
      if (ownerData.success) setOwnerReport(ownerData.data);
    }).finally(() => setLoading(false));
  }, [year]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Reports" description="Teacher-wise and owner commission reports" />
      <div className="mb-4">
        <Input type="number" className="w-32" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" />
      </div>
      <Tabs defaultValue="teacher">
        <TabsList>
          <TabsTrigger value="teacher">Teacher Reports</TabsTrigger>
          <TabsTrigger value="owner">Owner Commission</TabsTrigger>
        </TabsList>
        <TabsContent value="teacher" className="space-y-6 mt-4">
          {teacherReports.map((report) => (
            <Card key={report.teacherId}>
              <CardHeader>
                <CardTitle>Teacher: {report.teacherName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 grid gap-4 sm:grid-cols-4">
                  <div><p className="text-sm text-muted-foreground">Total Students</p><p className="text-xl font-bold">{report.totalStudents}</p></div>
                  <div><p className="text-sm text-muted-foreground">Total Collection</p><p className="text-xl font-bold">{formatCurrency(report.totalCollection)}</p></div>
                  <div><p className="text-sm text-muted-foreground">Teacher Earnings</p><p className="text-xl font-bold text-blue-600">{formatCurrency(report.totalTeacherEarnings)}</p></div>
                  <div><p className="text-sm text-muted-foreground">Owner Commission</p><p className="text-xl font-bold text-green-600">{formatCurrency(report.totalOwnerCommission)}</p></div>
                </div>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Receipt</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Month</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Teacher Share</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.payments.map((p: Payment) => (
                        <TableRow key={p._id}>
                          <TableCell className="font-mono text-sm">{p.receiptNumber}</TableCell>
                          <TableCell>{(p.studentId as Student)?.fullName}</TableCell>
                          <TableCell>{(p.classId as ClassItem)?.className}</TableCell>
                          <TableCell>{p.month}</TableCell>
                          <TableCell>{formatCurrency(p.amount)}</TableCell>
                          <TableCell>{formatCurrency(p.teacherShare)}</TableCell>
                          <TableCell>{formatDate(p.paymentDate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="owner" className="mt-4">
          {ownerReport && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Yearly Owner Commission: {formatCurrency(ownerReport.yearlyTotal)}</CardTitle></CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Total Collection</TableHead>
                          <TableHead>Owner Commission (20%)</TableHead>
                          <TableHead>Teacher Earnings</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ownerReport.teachers.map((t) => (
                          <TableRow key={t.teacherName}>
                            <TableCell className="font-medium">{t.teacherName}</TableCell>
                            <TableCell>{formatCurrency(t.totalCollection)}</TableCell>
                            <TableCell className="text-green-600">{formatCurrency(t.ownerCommission)}</TableCell>
                            <TableCell className="text-blue-600">{formatCurrency(t.teacherEarnings)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Monthly Breakdown</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                    {ownerReport.monthlyBreakdown.map((m) => (
                      <div key={m.month} className="rounded-lg border p-3">
                        <p className="text-sm text-muted-foreground">{m.month}</p>
                        <p className="font-bold">{formatCurrency(m.amount)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
