import { useQuery } from '@tanstack/react-query';
import { Copy, Download, ExternalLink, Printer } from 'lucide-react';
import { assetApi } from '../../api/assetApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { useToast } from '../../context/ToastContext';

export function AssetQrCard({ asset }) {
  const { toast } = useToast();
  const { data, isLoading } = useQuery({ queryKey: ['asset-qr', asset._id], queryFn: () => assetApi.qr(asset._id) });

  const copyLink = async () => {
    await navigator.clipboard.writeText(data.url);
    toast({ title: 'Public link copied', variant: 'success' });
  };

  const printLabel = () => {
    const w = window.open('', '_blank', 'width=420,height=560');
    w.document.write(`
      <html><head><title>${asset.assetCode} label</title>
      <style>
        body{font-family: system-ui, sans-serif; text-align:center; padding:24px;}
        h2{margin:0 0 4px;} p{margin:2px 0; color:#333;}
        img{margin-top:12px;}
        .code{font-family:monospace; font-weight:bold; letter-spacing:1px;}
      </style></head>
      <body>
        <p style="text-transform:uppercase;font-size:12px;letter-spacing:1px;color:#666;">MaintainIQ Asset Label</p>
        <h2>${asset.name}</h2>
        <p class="code">${asset.assetCode}</p>
        <p>${asset.location}</p>
        <img src="${data.qrDataUrl}" width="220" height="220" />
        <p style="font-size:11px;color:#666;">Scan this QR to view asset info and report an issue</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  if (isLoading) return <Skeleton className="h-72" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR & Public Link</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <img src={data.qrDataUrl} alt="Asset QR code" className="h-48 w-48 rounded-md border p-2" />
        <p className="break-all text-center text-xs text-muted-foreground">{data.url}</p>
        <div className="grid w-full grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            <Copy className="h-3.5 w-3.5" /> Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={() => assetApi.downloadQr(asset._id, `${asset.assetCode}.png`)}>
            <Download className="h-3.5 w-3.5" /> Download
          </Button>
          <Button variant="outline" size="sm" onClick={printLabel}>
            <Printer className="h-3.5 w-3.5" /> Print Label
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={data.url} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" /> Open Page
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
