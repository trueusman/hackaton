import { Badge } from './ui/badge';
import { ASSET_STATUS, ISSUE_STATUS, PRIORITY } from '../lib/constants';

const ASSET_STATUS_VARIANT = {
  [ASSET_STATUS.OPERATIONAL]: 'default',
  [ASSET_STATUS.ISSUE_REPORTED]: 'secondary',
  [ASSET_STATUS.UNDER_INSPECTION]: 'secondary',
  [ASSET_STATUS.UNDER_MAINTENANCE]: 'secondary',
  [ASSET_STATUS.OUT_OF_SERVICE]: 'destructive',
  [ASSET_STATUS.RETIRED]: 'outline',
};

const ASSET_STATUS_CLASSES = {
  [ASSET_STATUS.OPERATIONAL]: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  [ASSET_STATUS.ISSUE_REPORTED]: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  [ASSET_STATUS.UNDER_INSPECTION]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  [ASSET_STATUS.UNDER_MAINTENANCE]: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
  [ASSET_STATUS.OUT_OF_SERVICE]: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
  [ASSET_STATUS.RETIRED]: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30',
};

const ISSUE_STATUS_VARIANT = {
  [ISSUE_STATUS.REPORTED]: 'secondary',
  [ISSUE_STATUS.ASSIGNED]: 'default',
  [ISSUE_STATUS.INSPECTION_STARTED]: 'default',
  [ISSUE_STATUS.MAINTENANCE_IN_PROGRESS]: 'default',
  [ISSUE_STATUS.WAITING_FOR_PARTS]: 'secondary',
  [ISSUE_STATUS.RESOLVED]: 'default',
  [ISSUE_STATUS.CLOSED]: 'outline',
  [ISSUE_STATUS.REOPENED]: 'destructive',
};

const ISSUE_STATUS_CLASSES = {
  [ISSUE_STATUS.REPORTED]: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  [ISSUE_STATUS.ASSIGNED]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  [ISSUE_STATUS.INSPECTION_STARTED]: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
  [ISSUE_STATUS.MAINTENANCE_IN_PROGRESS]: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
  [ISSUE_STATUS.WAITING_FOR_PARTS]: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
  [ISSUE_STATUS.RESOLVED]: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  [ISSUE_STATUS.CLOSED]: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30',
  [ISSUE_STATUS.REOPENED]: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30',
};

const PRIORITY_VARIANT = {
  [PRIORITY.LOW]: 'outline',
  [PRIORITY.MEDIUM]: 'default',
  [PRIORITY.HIGH]: 'secondary',
  [PRIORITY.CRITICAL]: 'destructive',
};

const PRIORITY_CLASSES = {
  [PRIORITY.LOW]: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/30',
  [PRIORITY.MEDIUM]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  [PRIORITY.HIGH]: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30',
  [PRIORITY.CRITICAL]: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30 pulse-glow',
};

export function AssetStatusBadge({ status }) {
  return (
    <Badge 
      variant={ASSET_STATUS_VARIANT[status] || 'outline'} 
      className={`font-medium ${ASSET_STATUS_CLASSES[status] || ''}`}
    >
      {status}
    </Badge>
  );
}

export function IssueStatusBadge({ status }) {
  return (
    <Badge 
      variant={ISSUE_STATUS_VARIANT[status] || 'outline'}
      className={`font-medium ${ISSUE_STATUS_CLASSES[status] || ''}`}
    >
      {status}
    </Badge>
  );
}

// Critical issues must be "visually distinguishable" per the brief - a
// pulsing destructive badge rather than just another color in the list.
export function PriorityBadge({ priority }) {
  const isCritical = priority === PRIORITY.CRITICAL;
  return (
    <Badge 
      variant={PRIORITY_VARIANT[priority] || 'outline'} 
      className={`font-medium ${PRIORITY_CLASSES[priority] || ''} ${isCritical ? 'animate-pulse' : ''}`}
    >
      {isCritical ? '⚠ ' : ''}
      {priority}
    </Badge>
  );
}
