import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { INSTITUTE_NAME, OWNER_NAME, OWNER_SHARE_PERCENTAGE, TEACHER_SHARE_PERCENTAGE } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Institute configuration and account info" />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Institute owner information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{OWNER_NAME}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>sanchitha@saaga-institute.com</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Role</span><Badge>Admin</Badge></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Institute Info</CardTitle>
            <CardDescription>Business configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between"><span className="text-muted-foreground">Institute</span><span>{INSTITUTE_NAME}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Owner</span><span>{OWNER_NAME}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Owner Share</span><span>{OWNER_SHARE_PERCENTAGE}%</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Teacher Share</span><span>{TEACHER_SHARE_PERCENTAGE}%</span></div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Sharing Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>For classes conducted by other teachers: Owner receives {OWNER_SHARE_PERCENTAGE}% and Teacher receives {TEACHER_SHARE_PERCENTAGE}% of every student payment.</p>
            <p>For classes conducted by {OWNER_NAME} (owner): No split is applied. Owner income equals the full payment amount.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
