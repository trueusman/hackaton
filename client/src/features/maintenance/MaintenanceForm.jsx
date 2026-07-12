import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { maintenanceApi } from '../../api/maintenanceApi';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const emptyPart = () => ({ name: '', quantity: 1, cost: 0 });

export function MaintenanceForm({ issueId, onCreated }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [inspectionNotes, setInspectionNotes] = useState('');
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [parts, setParts] = useState([]);
  const [completionDate, setCompletionDate] = useState('');
  const [nextServiceDate, setNextServiceDate] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [dateError, setDateError] = useState('');

  const totalCost = parts.reduce((sum, p) => sum + (Number(p.cost) || 0) * (Number(p.quantity) || 1), 0);

  const mutation = useMutation({
    mutationFn: () =>
      maintenanceApi.create(issueId, {
        inspectionNotes,
        technicianNotes,
        workPerformed,
        parts,
        totalCost,
        completionDate: completionDate || undefined,
        nextServiceDate: nextServiceDate || undefined,
        evidence,
      }),
    onSuccess: (record) => {
      toast({ title: 'Maintenance record saved', variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['maintenance', issueId] });
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      setInspectionNotes('');
      setTechnicianNotes('');
      setWorkPerformed('');
      setParts([]);
      setEvidence([]);
      onCreated?.(record);
    },
    onError: (err) => toast({ title: 'Could not save maintenance record', description: err.message, variant: 'error' }),
  });

  const submit = () => {
    setDateError('');
    if (completionDate && nextServiceDate && nextServiceDate < completionDate) {
      setDateError('Next service date cannot be before the completion date');
      return;
    }
    mutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Maintenance Record</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label>Inspection notes</Label>
          <Textarea rows={2} value={inspectionNotes} onChange={(e) => setInspectionNotes(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Work performed</Label>
          <Textarea rows={2} value={workPerformed} onChange={(e) => setWorkPerformed(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Technician notes</Label>
          <Textarea rows={2} value={technicianNotes} onChange={(e) => setTechnicianNotes(e.target.value)} />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <Label>Parts used</Label>
            <Button type="button" size="sm" variant="outline" onClick={() => setParts([...parts, emptyPart()])}>
              <Plus className="h-3.5 w-3.5" /> Add part
            </Button>
          </div>
          <div className="space-y-2">
            {parts.map((part, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_70px_90px_auto] items-center gap-2">
                <Input
                  placeholder="Part name"
                  value={part.name}
                  onChange={(e) => setParts(parts.map((p, i) => (i === idx ? { ...p, name: e.target.value } : p)))}
                />
                <Input
                  type="number"
                  min={1}
                  value={part.quantity}
                  onChange={(e) => setParts(parts.map((p, i) => (i === idx ? { ...p, quantity: e.target.value } : p)))}
                />
                <Input
                  type="number"
                  min={0}
                  placeholder="Cost"
                  value={part.cost}
                  onChange={(e) => setParts(parts.map((p, i) => (i === idx ? { ...p, cost: e.target.value } : p)))}
                />
                <Button type="button" size="icon" variant="ghost" onClick={() => setParts(parts.filter((_, i) => i !== idx))}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-right text-sm font-medium">Total cost: {totalCost}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Completion date</Label>
            <Input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Next service date</Label>
            <Input type="date" value={nextServiceDate} onChange={(e) => setNextServiceDate(e.target.value)} />
          </div>
        </div>
        {dateError && <p className="text-xs text-destructive">{dateError}</p>}

        <div className="space-y-1.5">
          <Label>Evidence (optional)</Label>
          <Input type="file" multiple accept="image/*,video/*" onChange={(e) => setEvidence(Array.from(e.target.files))} />
        </div>

        <Button className="w-full" onClick={submit} disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save maintenance record'}
        </Button>
      </CardContent>
    </Card>
  );
}
