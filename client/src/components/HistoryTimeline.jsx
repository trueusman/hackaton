import { formatDateTime } from '../lib/utils';
import { EmptyState } from './EmptyState';
import { History } from 'lucide-react';

export function HistoryTimeline({ entries }) {
  if (!entries?.length) {
    return <EmptyState icon={History} title="No history yet" description="Actions on this record will appear here automatically." />;
  }

  return (
    <ol className="relative space-y-4 border-l pl-4">
      {entries.map((entry, idx) => (
        <li key={entry._id || idx} className="relative">
          <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
          <p className="text-sm font-medium">{entry.message}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(entry.createdAt)}
            {entry.actor?.name ? ` · ${entry.actor.name}` : ''}
            {entry.issue?.issueNumber ? ` · ${entry.issue.issueNumber}` : ''}
          </p>
        </li>
      ))}
    </ol>
  );
}
