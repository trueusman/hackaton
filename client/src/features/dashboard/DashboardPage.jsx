import { useQuery } from '@tanstack/react-query';
import { Boxes, AlertTriangle, Wrench, UserX } from 'lucide-react';
import { dashboardApi } from '../../api/dashboardApi';
import { PageHeader } from '../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { useAuth } from '../../context/AuthContext';

function StatCard({ label, value, icon: Icon, tone = 'default' }) {
  const toneClasses = {
    default: 'gradient-primary',
    warning: 'gradient-warning',
    destructive: 'gradient-destructive',
  };
  const toneTextClasses = {
    default: 'text-white',
    warning: 'text-white',
    destructive: 'text-white',
  };
  return (
    <Card className="card-hover border-border/50 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardContent className="flex items-center justify-between p-6 relative z-10">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold">{value ?? '—'}</p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${toneClasses[tone]}`}>
          <Icon className={`h-7 w-7 ${toneTextClasses[tone]}`} />
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useQuery({ queryKey: ['dashboard-summary'], queryFn: dashboardApi.summary });

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`}
        description="Operational summary across all registered assets and open issues."
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total assets" value={summary?.totalAssets} icon={Boxes} />
          <StatCard label="Open issues" value={summary?.openIssues} icon={Wrench} tone="warning" />
          <StatCard label="Critical open issues" value={summary?.criticalOpenIssues} icon={AlertTriangle} tone="destructive" />
          <StatCard label="Unassigned issues" value={summary?.unassignedIssues} icon={UserX} tone="warning" />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/50 shadow-md">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" />
              Assets by status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {summary?.assetsByStatus &&
              Object.entries(summary.assetsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium">{status}</span>
                  <span className="text-lg font-bold text-primary">{count}</span>
                </div>
              ))}
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-md">
          <CardHeader className="bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Issues by status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {summary?.issuesByStatus &&
              Object.entries(summary.issuesByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium">{status}</span>
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">{count}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
