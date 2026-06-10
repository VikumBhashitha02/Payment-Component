"use client";

import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Wallet,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "@/components/shared/stat-card";
import { ChartContainer } from "@/components/charts/chart-container";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

interface DashboardData {
  stats: DashboardStats;
  charts: {
    monthlyRevenue: { month: string; revenue: number }[];
    teacherEarnings: { name: string; value: number }[];
    studentDistribution: { name: string; value: number }[];
    revenueTrend: { month: string; revenue: number; ownerShare: number }[];
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-center text-muted-foreground">Failed to load dashboard</p>;

  const { stats, charts } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your institute</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} />
        <StatCard title="Total Teachers" value={stats.totalTeachers} icon={GraduationCap} />
        <StatCard title="Total Classes" value={stats.totalClasses} icon={BookOpen} />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={DollarSign}
        />
        <StatCard
          title="Owner Income"
          value={formatCurrency(stats.ownerIncome)}
          icon={TrendingUp}
        />
        <StatCard
          title="Teacher Payments"
          value={formatCurrency(stats.teacherPayments)}
          icon={Wallet}
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={AlertCircle}
          description="Students without payment this month"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartContainer title="Monthly Revenue">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Teacher Earnings">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.teacherEarnings}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {charts.teacherEarnings.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Student Distribution by Teacher">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.studentDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {charts.studentDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Revenue Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="ownerShare" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
