import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, MapPin, Tag } from 'lucide-react';
import { assetApi } from '../../api/assetApi';
import { AssetStatusBadge } from '../../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { FullPageSpinner } from '../../components/Spinner';
import { formatDate } from '../../lib/utils';
import { ASSET_STATUS } from '../../lib/constants';

export function PublicAssetPage() {
  const { assetCode } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['public-asset', assetCode],
    queryFn: () => assetApi.getPublic(assetCode),
    retry: false,
  });

  if (isLoading) return <FullPageSpinner />;

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h1 className="text-lg font-semibold">Asset not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The code "{assetCode}" doesn't match any registered asset. Double-check the QR code or link.
        </p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Go back
        </Button>
      </div>
    );
  }

  const { asset, recentActivity } = data;
  const isRetired = asset.status === ASSET_STATUS.RETIRED;

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg"
      >
        <div className="mb-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">MaintainIQ Asset Page</span>
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>{asset.name}</CardTitle>
              <p className="mt-1 font-mono text-xs text-muted-foreground">{asset.assetCode}</p>
            </div>
            <AssetStatusBadge status={asset.status} />
          </CardHeader>
          <CardContent>
            {isRetired && (
              <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                This asset has been retired and is no longer in active service.
              </div>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" /> {asset.category}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" /> {asset.location}
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium">{asset.condition}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last service</span>
                <span className="font-medium">{formatDate(asset.lastServiceDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Next service due</span>
                <span className="font-medium">{formatDate(asset.nextServiceDate)}</span>
              </div>
            </div>

            {recentActivity?.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Recent activity</p>
                <ul className="space-y-1.5">
                  {recentActivity.slice(0, 4).map((a, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      {a.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isRetired && (
              <Button asChild className="mt-5 w-full">
                <Link to={`/assets/public/${assetCode}/report`}>
                  Report an Issue <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Already reported an issue? <Link to="/track" className="text-primary hover:underline">Check its status</Link>
        </p>
      </motion.div>
    </div>
  );
}
