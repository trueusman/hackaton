import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Sparkles, CheckCircle2, TriangleAlert, ArrowLeft } from 'lucide-react';
import { issueApi } from '../../api/issueApi';
import { useToast } from '../../context/ToastContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { PRIORITY } from '../../lib/constants';

const AI_ERROR_MESSAGES = {
  AI_TIMEOUT: 'AI triage timed out. You can still fill in the details manually below.',
  AI_UNAVAILABLE: 'AI triage is temporarily unavailable. Please enter the details manually.',
  AI_INVALID_OUTPUT: "AI couldn't produce a valid suggestion. Please enter the details manually.",
  AI_NOT_CONFIGURED: 'AI triage is not configured for this deployment. Please enter the details manually.',
};

export function ReportIssuePage() {
  const { assetCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [complaint, setComplaint] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState(PRIORITY.MEDIUM);
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [submitted, setSubmitted] = useState(null);

  const triageMutation = useMutation({
    mutationFn: () => issueApi.previewAiTriage({ assetCode, complaint }),
    onSuccess: (suggestion) => {
      setAiSuggestion(suggestion);
      setAiError(null);
      setTitle(suggestion.title);
      setCategory(suggestion.category);
      setPriority(suggestion.priority);
    },
    onError: (err) => {
      setAiError(AI_ERROR_MESSAGES[err.code] || 'AI triage failed. Please enter the details manually.');
    },
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      issueApi.create({
        assetCode,
        title: title || complaint.slice(0, 80),
        description: complaint,
        category,
        priority,
        reporterName,
        reporterContact,
        evidence,
        aiSuggestion: aiSuggestion || undefined,
      }),
    onSuccess: (issue) => setSubmitted(issue),
    onError: (err) => toast({ title: 'Could not submit issue', description: err.message, variant: 'error' }),
  });

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center bg-gradient-to-br from-success/5 to-background">
        <div className="w-20 h-20 rounded-full gradient-success flex items-center justify-center shadow-2xl animate-bounce">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Issue reported successfully!</h1>
          <p className="max-w-md text-base text-muted-foreground">
            Your issue number is <span className="font-mono font-bold text-lg text-primary bg-primary/10 px-2 py-1 rounded">{submitted.issueNumber}</span>
          </p>
          <p className="text-sm text-muted-foreground">Save this number to track your issue status</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={() => navigate(`/assets/public/${assetCode}`)}>
            Back to asset page
          </Button>
          <Button size="lg" asChild className="gradient-primary text-white shadow-lg">
            <Link to="/track">Track this issue</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/20 to-background px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link to={`/assets/public/${assetCode}`} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to asset
        </Link>
        <Card className="shadow-2xl border-border/50">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardTitle className="text-2xl">Report an Issue</CardTitle>
            <CardDescription className="text-base">Asset <span className="font-mono font-semibold">{assetCode}</span>. Describe the problem in your own words.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium">What's wrong?</Label>
              <Textarea
                rows={5}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="e.g. The projector display is flickering and sometimes does not detect HDMI."
                className="resize-none"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full border-primary/30 hover:bg-primary/5"
              disabled={!complaint.trim() || triageMutation.isPending}
              onClick={() => triageMutation.mutate()}
            >
              <Sparkles className="h-5 w-5 text-primary" />
              {triageMutation.isPending ? 'Analyzing with AI…' : 'Get AI Suggestion'}
            </Button>

            {aiError && (
              <div className="flex items-start gap-3 rounded-xl border-2 border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-400">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" /> 
                <p>{aiError}</p>
              </div>
            )}

            {aiSuggestion && (
              <div className="space-y-3 rounded-xl border-2 border-primary/30 bg-primary/5 p-5 text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-base">AI Suggestion (review and edit below)</p>
                </div>
                {aiSuggestion.possibleCauses?.length > 0 && (
                  <p>
                    <span className="font-medium">Possible causes: </span>
                    {aiSuggestion.possibleCauses.join(', ')}
                  </p>
                )}
                {aiSuggestion.initialChecks?.length > 0 && (
                  <p>
                    <span className="font-medium">Initial checks: </span>
                    {aiSuggestion.initialChecks.join('; ')}
                  </p>
                )}
                {aiSuggestion.recurringPatternWarning && (
                  <p className="flex items-center gap-2 font-medium text-destructive">
                    <TriangleAlert className="h-4 w-4" /> {aiSuggestion.recurringPatternWarning}
                  </p>
                )}
                <p className="text-xs text-muted-foreground border-t pt-3">
                  This is advisory only — a technician will confirm the actual cause. For anything involving live wiring,
                  gas, fire, or structural damage, stop using the asset and wait for a qualified technician.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm font-medium">Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short issue title" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(PRIORITY).map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Your name (optional)</Label>
                <Input value={reporterName} onChange={(e) => setReporterName(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Contact (optional)</Label>
                <Input value={reporterContact} onChange={(e) => setReporterContact(e.target.value)} className="h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Photo/video evidence (optional)</Label>
              <Input type="file" multiple accept="image/*,video/*" onChange={(e) => setEvidence(Array.from(e.target.files))} className="h-11" />
              {evidence.length > 0 && <Badge variant="secondary" className="mt-2">{evidence.length} file(s) selected</Badge>}
            </div>

            <Button
              size="lg"
              className="w-full h-12 gradient-primary text-white shadow-lg hover:shadow-xl"
              disabled={!complaint.trim() || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              {submitMutation.isPending ? 'Submitting…' : 'Submit Issue'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
