import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { QrCode, Search, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export function LandingPage() {
  const [assetCode, setAssetCode] = useState('');
  const navigate = useNavigate();

  const goToAsset = (e) => {
    e.preventDefault();
    if (assetCode.trim()) navigate(`/assets/public/${assetCode.trim().toUpperCase()}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-purple-500/10 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary text-2xl font-bold text-white shadow-2xl">
          M
        </div>
        <h1 className="text-4xl font-bold tracking-tight">MaintainIQ</h1>
        <p className="mt-2 text-lg text-muted-foreground">Scan. Report. Diagnose. Maintain.</p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/95 backdrop-blur-sm relative z-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <QrCode className="h-5 w-5 text-primary" /> Find your asset
          </CardTitle>
          <CardDescription className="text-base">Scanned a QR code? Or enter the asset code printed on the label.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={goToAsset} className="flex gap-3">
            <Input
              placeholder="AST-A1B2C3"
              value={assetCode}
              onChange={(e) => setAssetCode(e.target.value)}
              className="font-mono uppercase h-12 text-base"
            />
            <Button type="submit" size="lg" className="gradient-primary text-white shadow-lg hover:shadow-xl px-6">
              <Search className="h-5 w-5" />
            </Button>
          </form>
          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/track" className="text-primary hover:underline font-medium">Check a reported issue's status</Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <Link
        to="/login"
        className="relative z-10 mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-accent"
      >
        <ShieldCheck className="h-4 w-4" /> Staff sign in
      </Link>
    </div>
  );
}
