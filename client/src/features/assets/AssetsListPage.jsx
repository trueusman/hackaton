import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { assetApi } from '../../api/assetApi';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';
import { AssetStatusBadge } from '../../components/StatusBadge';
import { Input } from '../../components/ui/input';
import { Skeleton } from '../../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AssetFormDialog } from './AssetFormDialog';
import { ASSET_STATUS } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';

export function AssetsListPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['assets', search, status],
    queryFn: () => assetApi.list({ search: search || undefined, status: status === 'all' ? undefined : status }),
  });

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Every registered physical asset, its QR link, and current condition."
        actions={user?.role === 'admin' ? <AssetFormDialog /> : null}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, category, location…"
            className="pl-10 h-12 text-base rounded-xl border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-64 h-12 rounded-xl border-border/50">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(ASSET_STATUS).map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12" />
          ))}
        </div>
      ) : !data?.items?.length ? (
        <EmptyState title="No assets found" description="Try a different search or register a new asset." />
      ) : (
        <div className="rounded-xl border border-border/50 overflow-hidden shadow-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Asset</TableHead>
                <TableHead className="font-semibold">Code</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Technician</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((asset) => (
                <TableRow key={asset._id} className="hover:bg-muted/20 transition-colors">
                  <TableCell>
                    <Link to={`/app/assets/${asset._id}`} className="font-medium hover:underline hover:text-primary transition-colors">
                      {asset.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{asset.category}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs bg-muted/30 rounded px-2">{asset.assetCode}</TableCell>
                  <TableCell className="text-sm">{asset.location}</TableCell>
                  <TableCell>
                    <AssetStatusBadge status={asset.status} />
                  </TableCell>
                  <TableCell className="text-sm">{asset.assignedTechnician?.name || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
