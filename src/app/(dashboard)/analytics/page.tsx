"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/shared/page-header";
import { ChartContainer } from "@/components/charts/chart-container";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

interface AnalyticsData {
  charts: {
    monthlyRevenue: { month: string; revenue: number }[];
    teacherEarnings: { name: string; value: number }[];
    studentDistribution: { name: string; value: number }[];
    revenueTrend: { month: string; revenue: number; ownerShare: number }[];
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((res) => { if (res.success) setData(res.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p>Failed to load analytics</p>;

  const { charts } = data;
  const teacherMonthlyEarnings = charts.teacherEarnings.map((t) => ({
    name: t.name,
    earnings: t.value,
  }));
  const ownerCommissionByTeacher = charts.teacherEarnings.map((t) => ({
    name: t.name,
    commission: Math.round(t.value * 0.25),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Detailed charts and insights" />
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartContainer title="Monthly Revenue">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Teacher Earnings Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={charts.teacherEarnings} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {charts.teacherEarnings.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Student Distribution by Teacher">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={charts.studentDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                {charts.studentDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Monthly Revenue Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="ownerShare" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Teacher Monthly Earnings">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={teacherMonthlyEarnings}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="earnings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <ChartContainer title="Owner Commission by Teacher">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={ownerCommissionByTeacher} dataKey="commission" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {ownerCommissionByTeacher.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
