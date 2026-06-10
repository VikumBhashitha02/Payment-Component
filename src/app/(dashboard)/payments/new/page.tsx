"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StudentSearchSelect } from "@/components/shared/student-search-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { paymentSchema, type PaymentFormData } from "@/lib/validations";
import { MONTHS, PAYMENT_METHODS } from "@/lib/constants";
import { calculateRevenueSplit } from "@/lib/revenue-sharing";
import { formatCurrency, generateReceiptNumber } from "@/lib/utils";
import type { Student, ClassItem, Teacher } from "@/types";

export default function NewPaymentPage() {
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<ClassItem[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [receiptNumber] = useState(generateReceiptNumber());

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      receiptNumber,
      month: MONTHS[new Date().getMonth()],
      year: new Date().getFullYear(),
      paymentMethod: "Cash",
      paymentDate: new Date().toISOString().split("T")[0],
    },
  });

  const amount = form.watch("amount") || 0;
  const teacher = selectedClass?.teacherId as Teacher | undefined;
  const split = teacher
    ? calculateRevenueSplit(amount, teacher.fullName, teacher.isOwner)
    : { ownerShare: 0, teacherShare: 0 };

  const handleStudentChange = async (studentId: string, student: Student) => {
    form.setValue("studentId", studentId);
    setSelectedStudent(student);
    form.setValue("classId", "");
    form.setValue("teacherId", "");
    form.setValue("amount", 0);
    setSelectedClass(null);
    setEnrolledClasses([]);
    setLoadingClasses(true);

    try {
      const res = await fetch(
        `/api/enrollments?studentId=${studentId}&status=active&limit=100`
      );
      const data = await res.json();
      if (data.success) {
        const classes = data.data
          .map((e: { classId: ClassItem | string }) => e.classId)
          .filter((c: ClassItem | string): c is ClassItem => typeof c === "object" && c !== null);
        setEnrolledClasses(classes);
        if (classes.length === 0) {
          toast.info("This student has no active class enrollments");
        }
      }
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleClassChange = (classId: string) => {
    form.setValue("classId", classId);
    const cls = enrolledClasses.find((c) => c._id === classId);
    setSelectedClass(cls || null);
    if (cls) {
      const tid = typeof cls.teacherId === "object" ? cls.teacherId._id : cls.teacherId;
      form.setValue("teacherId", tid);
      form.setValue("amount", cls.monthlyFee);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, receiptNumber }),
    });
    const result = await res.json();
    if (result.success) {
      toast.success("Payment recorded successfully");
      router.push(`/payments/${result.data._id}/receipt`);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <PageHeader title="New Payment" description="Record a new student payment" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Receipt Number</Label>
                  <Input value={receiptNumber} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Student</Label>
                  <StudentSearchSelect
                    value={form.watch("studentId")}
                    selectedStudent={selectedStudent}
                    onValueChange={handleStudentChange}
                  />
                  {form.formState.errors.studentId && (
                    <p className="text-sm text-destructive">{form.formState.errors.studentId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select
                    value={form.watch("classId")}
                    onValueChange={handleClassChange}
                    disabled={!selectedStudent || loadingClasses || enrolledClasses.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingClasses
                            ? "Loading classes..."
                            : !selectedStudent
                              ? "Select a student first"
                              : enrolledClasses.length === 0
                                ? "No enrolled classes"
                                : "Select class"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {enrolledClasses.map((c) => (
                        <SelectItem key={c._id} value={c._id}>
                          {c.className} - {c.subject} ({formatCurrency(c.monthlyFee)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <Input value={teacher?.fullName || ""} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={form.watch("month")} onValueChange={(v) => form.setValue("month", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" {...form.register("year")} />
                </div>
                <div className="space-y-2">
                  <Label>Amount (Rs.)</Label>
                  <Input type="number" {...form.register("amount")} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={form.watch("paymentMethod")} onValueChange={(v) => form.setValue("paymentMethod", v as PaymentFormData["paymentMethod"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input type="date" {...form.register("paymentDate")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Remarks</Label>
                  <Textarea {...form.register("remarks")} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit">Save Payment</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Revenue Split Preview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between"><span className="text-muted-foreground">Total Amount</span><span className="font-bold">{formatCurrency(amount)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Owner Share</span><span className="font-bold text-green-600">{formatCurrency(split.ownerShare)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teacher Share</span><span className="font-bold text-blue-600">{formatCurrency(split.teacherShare)}</span></div>
            {teacher?.isOwner && (
              <p className="text-sm text-muted-foreground">Owner&apos;s own class — no 20/80 split applied.</p>
            )}
            {teacher && !teacher.isOwner && (
              <p className="text-sm text-muted-foreground">Standard split: Owner 20% / Teacher 80%</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
