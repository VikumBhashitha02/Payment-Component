"use client";

import { useEffect, useState, use } from "react";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { INSTITUTE_NAME } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportToPDF } from "@/lib/export";
import type { Payment, Student, Teacher, ClassItem } from "@/types";

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/payments/${id}`)
      .then((r) => r.json())
      .then((data) => { if (data.success) setPayment(data.data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!payment) return <p>Payment not found</p>;

  const student = payment.studentId as Student;
  const teacher = payment.teacherId as Teacher;
  const classItem = payment.classId as ClassItem;

  const handlePrint = () => window.print();

  const handlePDF = () => {
    exportToPDF(
      [{
        receiptNumber: payment.receiptNumber,
        student: student?.fullName,
        class: classItem?.className,
        teacher: teacher?.fullName,
        month: `${payment.month} ${payment.year}`,
        amount: payment.amount,
        date: formatDate(payment.paymentDate),
      }],
      `receipt-${payment.receiptNumber}`,
      `${INSTITUTE_NAME} - Receipt`,
      [
        { key: "receiptNumber", label: "Receipt" },
        { key: "student", label: "Student" },
        { key: "class", label: "Class" },
        { key: "teacher", label: "Teacher" },
        { key: "month", label: "Month" },
        { key: "amount", label: "Amount" },
        { key: "date", label: "Date" },
      ]
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="no-print mb-4 flex justify-end gap-2">
        <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" />Print</Button>
        <Button variant="outline" onClick={handlePDF}><Download className="mr-2 h-4 w-4" />Export PDF</Button>
      </div>
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">{INSTITUTE_NAME}</h1>
            <p className="text-muted-foreground">Payment Receipt</p>
          </div>
          <div className="mb-6 flex justify-between border-b pb-4">
            <div>
              <p className="text-sm text-muted-foreground">Receipt No.</p>
              <p className="font-mono font-bold">{payment.receiptNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(payment.paymentDate)}</p>
            </div>
          </div>
          <div className="space-y-3 mb-8">
            <div className="flex justify-between"><span className="text-muted-foreground">Student</span><span className="font-medium">{student?.fullName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Student ID</span><span>{student?.studentId}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Class</span><span>{classItem?.className} - {classItem?.subject}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teacher</span><span>{teacher?.fullName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Period</span><span>{payment.month} {payment.year}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment Method</span><span>{payment.paymentMethod}</span></div>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Amount Paid</span>
              <span>{formatCurrency(payment.amount)}</span>
            </div>
          </div>
          {payment.remarks && (
            <p className="mt-4 text-sm text-muted-foreground">Remarks: {payment.remarks}</p>
          )}
          <p className="mt-8 text-center text-sm text-muted-foreground">Thank you for your payment!</p>
        </CardContent>
      </Card>
    </div>
  );
}
