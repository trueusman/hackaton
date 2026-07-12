import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Sparkles, UserPlus } from 'lucide-react';
import { issueApi } from '../../api/issueApi';
import { maintenanceApi } from '../../api/maintenanceApi';
import { userApi } from '../../api/authApi';
import { IssueStatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { PageHeader } from '../../components/PageHeader';
import { FullPageSpinner } from '../../components/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { formatDateTime } from '../../lib/utils';
import { ISSUE_STATUS, ISSUE_STATUS_TRANSITIONS, ROLES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MaintenanceForm } from '../maintenance/MaintenanceForm';

function AiProvenanceRow({ label, field }) {
  if (!field) return null;
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1">
        {field.value?.toString()}
        {field.aiSuggested && (
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {field.userEdited ? 'AI-suggested, edited' : 'AI-suggested'}
          </span>
        )}
      </span>
    </div>
  );
}

export function IssueDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');

  const { data: issue, isLoading } = useQuery({ queryKey: ['issue', id], queryFn: () => issueApi.get(id) });
  const { data: records } = useQuery({ queryKey: ['maintenance', id], queryFn: () => maintenanceApi.listForIssue(id) });
  const { data: technicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: userApi.listTechnicians,
    enabled: user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERVISOR,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['issue', id] });
    queryClient.invalidateQueries({ queryKey: ['issues'] });
  };

  const assignMutation = useMutation({
    mutationFn: (technicianId) => issueApi.assign(id, technicianId),
    onSuccess: () => {
      toast({ title: 'Issue assigned', variant: 'success' });
      invalidate();
    },
    onError: (err) => toast({ title: 'Could not assign', description: err.message, variant: 'error' }),
  });

  const statusMutation = useMutation({
    mutationFn: (status) => issueApi.updateStatus(id, status),
    onSuccess: () => {
      toast({ title: 'Status updated', variant: 'success' });
      invalidate();
    },
    onError: (err) => toast({ title: 'Could not update status', description: err.message, variant: 'error' }),
  });

  const resolveMutation = useMutation({
    mutationFn: () => issueApi.resolve(id, resolutionSummary),
    onSuccess: () => {
      toast({ title: 'Issue resolved', variant: 'success' });
      setResolutionSummary('');
      invalidate();
    },
    onError: (err) => toast({ title: 'Could not resolve', description: err.message, variant: 'error' }),
  });

  const closeMutation = useMutation({
    mutationFn: () => issueApi.close(id),
    onSuccess: () => {
      toast({ title: 'Issue closed', variant: 'success' });
      invalidate();
    },
    onError: (err) => toast({ title: 'Could not close', description: err.message, variant: 'error' }),
  });

  const reopenMutation = useMutation({
    mutationFn: () => issueApi.reopen(id, 'Reopened from dashboard'),
    onSuccess: () => {
      toast({ title: 'Issue reopened', variant: 'success' });
      invalidate();
    },
    onError: (err) => toast({ title: 'Could not reopen', description: err.message, variant: 'error' }),
  });

  if (isLoading || !issue) return <FullPageSpinner />;

  const canManage = user.role === ROLES.ADMIN || user.role === ROLES.SUPERVISOR;
  const isOwnerTechnician = user.role === ROLES.TECHNICIAN && issue.assignedTechnician?._id === user.id;
  const canWorkOn = canManage || isOwnerTechnician;
  const nextStatuses = (ISSUE_STATUS_TRANSITIONS[issue.status] || []).filter((s) => s !== ISSUE_STATUS.RESOLVED);
  const canResolve = canWorkOn && (ISSUE_STATUS_TRANSITIONS[issue.status] || []).includes(ISSUE_STATUS.RESOLVED);
  const hasMaintenanceNote = records && records.length > 0;

  return (
    <div>
      <PageHeader
        title={issue.title}
        description={`${issue.issueNumber} · ${issue.asset?.name} (${issue.asset?.assetCode})`}
        actions={
          <>
            <PriorityBadge priority={issue.priority} />
            <IssueStatusBadge status={issue.status} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{issue.description}</p>
              {issue.reporterName && (
                <p className="text-xs text-muted-foreground">
                  Reported by {issue.reporterName} {issue.reporterContact ? `(${issue.reporterContact})` : ''} on{' '}
                  {formatDateTime(issue.createdAt)}
                </p>
              )}
              {issue.evidence?.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {issue.evidence.map((e, i) =>
                    e.resourceType === 'video' ? (
                      <video key={i} src={e.url} controls className="rounded-md border" />
                    ) : (
                      <img key={i} src={e.url} alt="Evidence" className="rounded-md border object-cover" />
                    ),
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {issue.aiTriage?.triagedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> AI Triage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <AiProvenanceRow label="Title" field={issue.aiTriage.title} />
                <AiProvenanceRow label="Category" field={issue.aiTriage.category} />
                <AiProvenanceRow label="Priority" field={issue.aiTriage.priority} />
                {issue.aiTriage.raw?.possibleCauses?.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Possible causes: {issue.aiTriage.raw.possibleCauses.join(', ')}
                  </p>
                )}
                {issue.aiTriage.raw?.initialChecks?.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Initial checks: {issue.aiTriage.raw.initialChecks.join('; ')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {canWorkOn && issue.status !== ISSUE_STATUS.CLOSED && (
            <MaintenanceForm issueId={id} />
          )}

          {records?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {records.map((r) => (
                  <div key={r._id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{r.technician?.name}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(r.createdAt)}</span>
                    </div>
                    {r.workPerformed && <p className="mt-1">{r.workPerformed}</p>}
                    {r.inspectionNotes && <p className="mt-1 text-xs text-muted-foreground">Inspection: {r.inspectionNotes}</p>}
                    <p className="mt-1 text-xs font-medium">Cost: {r.totalCost}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Assign Technician
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger>
                    <SelectValue placeholder={issue.assignedTechnician?.name || 'Select technician'} />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians?.map((t) => (
                      <SelectItem key={t._id} value={t._id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  size="sm"
                  disabled={!selectedTechnician || assignMutation.isPending}
                  onClick={() => assignMutation.mutate(selectedTechnician)}
                >
                  Assign
                </Button>
              </CardContent>
            </Card>
          )}

          {canWorkOn && issue.status !== ISSUE_STATUS.CLOSED && (
            <Card>
              <CardHeader>
                <CardTitle>Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {nextStatuses.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate(s)}
                  >
                    Move to "{s}"
                  </Button>
                ))}

                {canResolve && (
                  <div className="space-y-2 border-t pt-3">
                    <Textarea
                      rows={2}
                      placeholder="Resolution summary (required)"
                      value={resolutionSummary}
                      onChange={(e) => setResolutionSummary(e.target.value)}
                    />
                    {!hasMaintenanceNote && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Add at least one maintenance record before resolving.
                      </p>
                    )}
                    <Button
                      className="w-full"
                      size="sm"
                      disabled={!resolutionSummary.trim() || !hasMaintenanceNote || resolveMutation.isPending}
                      onClick={() => resolveMutation.mutate()}
                    >
                      Resolve Issue
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {canManage && issue.status === ISSUE_STATUS.RESOLVED && (
            <Button className="w-full" variant="outline" onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending}>
              Close Issue
            </Button>
          )}

          {canManage && [ISSUE_STATUS.RESOLVED, ISSUE_STATUS.CLOSED].includes(issue.status) && (
            <Button className="w-full" variant="secondary" onClick={() => reopenMutation.mutate()} disabled={reopenMutation.isPending}>
              Reopen Issue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
