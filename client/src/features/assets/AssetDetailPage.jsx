import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi } from '../../api/assetApi';
import { maintenanceApi } from '../../api/maintenanceApi';
import { PageHeader } from '../../components/PageHeader';
import { AssetStatusBadge } from '../../components/StatusBadge';
import { HistoryTimeline } from '../../components/HistoryTimeline';
import { FullPageSpinner } from '../../components/Spinner';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { formatDate, formatCurrency } from '../../lib/utils';
import { AssetQrCard } from './AssetQrCard';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ASSET_STATUS } from '../../lib/constants';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value ?? '—'}</span>
    </div>
  );
}

export function AssetDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: asset, isLoading } = useQuery({ queryKey: ['asset', id], queryFn: () => assetApi.get(id) });
  const { data: history } = useQuery({ queryKey: ['asset-history', id], queryFn: () => assetApi.history(id) });
  const { data: maintenanceRecords } = useQuery({
    queryKey: ['asset-maintenance', id],
    queryFn: () => maintenanceApi.listForAsset(id),
  });

  const retireMutation = useMutation({
    mutationFn: () => assetApi.retire(id),
    onSuccess: () => {
      toast({ title: 'Asset retired', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      queryClient.invalidateQueries({ queryKey: ['asset-history', id] });
    },
    onError: (err) => toast({ title: 'Could not retire asset', description: err.message, variant: 'error' }),
  });

  if (isLoading || !asset) return <FullPageSpinner />;

  const canManage = user?.role === 'admin';

  return (
    <div>
      <PageHeader
        title={asset.name}
        description={`${asset.assetCode} · ${asset.category}`}
        actions={
          canManage && asset.status !== ASSET_STATUS.RETIRED ? (
            <Button variant="destructive" size="sm" onClick={() => retireMutation.mutate()} disabled={retireMutation.isPending}>
              Retire asset
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle>Overview</CardTitle>
              <AssetStatusBadge status={asset.status} />
            </CardHeader>
            <CardContent>
              <InfoRow label="Location" value={asset.location} />
              <InfoRow label="Condition" value={asset.condition} />
              <InfoRow label="Model" value={asset.model} />
              <InfoRow label="Assigned technician" value={asset.assignedTechnician?.name} />
              <InfoRow label="Last service date" value={formatDate(asset.lastServiceDate)} />
              <InfoRow label="Next service date" value={formatDate(asset.nextServiceDate)} />
              {canManage && <InfoRow label="Purchase cost" value={formatCurrency(asset.purchaseCost)} />}
              {asset.description && <p className="mt-3 text-sm text-muted-foreground">{asset.description}</p>}
            </CardContent>
          </Card>

          <Tabs defaultValue="history">
            <TabsList>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance Records</TabsTrigger>
            </TabsList>
            <TabsContent value="history">
              <Card>
                <CardContent className="pt-5">
                  <HistoryTimeline entries={history} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="maintenance">
              <Card>
                <CardContent className="space-y-4 pt-5">
                  {!maintenanceRecords?.length && <p className="text-sm text-muted-foreground">No maintenance recorded yet.</p>}
                  {maintenanceRecords?.map((r) => (
                    <div key={r._id} className="rounded-md border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.technician?.name}</span>
                        <span className="text-muted-foreground">{formatDate(r.completionDate || r.createdAt)}</span>
                      </div>
                      {r.workPerformed && <p className="mt-1">{r.workPerformed}</p>}
                      {r.parts?.length > 0 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Parts: {r.parts.map((p) => `${p.name} x${p.quantity}`).join(', ')}
                        </p>
                      )}
                      <p className="mt-1 text-xs font-medium">Cost: {formatCurrency(r.totalCost)}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <AssetQrCard asset={asset} />
        </div>
      </div>
    </div>
  );
}
