import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import { issueApi } from '../../api/issueApi';
import { IssueStatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { formatDate } from '../../lib/utils';

export function TrackIssuePage() {
  const [issueNumber, setIssueNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    if (!issueNumber.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const issue = await issueApi.getPublicStatus(issueNumber.trim().toUpperCase());
      setResult(issue);
    } catch (err) {
      setError(err.message || 'Issue not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back home
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Track your issue</CardTitle>
          <CardDescription>Enter the issue number you received when reporting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={search} className="flex gap-2">
            <Input
              placeholder="ISS-2026-000123"
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
              className="font-mono uppercase"
            />
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          {result && (
            <div className="mt-4 space-y-2 rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{result.title}</span>
                <IssueStatusBadge status={result.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{result.issueNumber}</span>
                <PriorityBadge priority={result.priority} />
              </div>
              <p className="text-xs text-muted-foreground">Reported {formatDate(result.createdAt)}</p>
              {result.resolvedAt && <p className="text-xs text-muted-foreground">Resolved {formatDate(result.resolvedAt)}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
