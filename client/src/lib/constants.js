// Mirrors server/src/constants/* - kept in sync manually since client and
// server are separate deployable apps with no shared package.
export const ROLES = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  REPORTER: 'reporter',
  SUPERVISOR: 'supervisor',
};

export const ASSET_STATUS = {
  OPERATIONAL: 'Operational',
  ISSUE_REPORTED: 'Issue Reported',
  UNDER_INSPECTION: 'Under Inspection',
  UNDER_MAINTENANCE: 'Under Maintenance',
  OUT_OF_SERVICE: 'Out of Service',
  RETIRED: 'Retired',
};

export const ISSUE_STATUS = {
  REPORTED: 'Reported',
  ASSIGNED: 'Assigned',
  INSPECTION_STARTED: 'Inspection Started',
  MAINTENANCE_IN_PROGRESS: 'Maintenance In Progress',
  WAITING_FOR_PARTS: 'Waiting for Parts',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
};

export const ISSUE_STATUS_TRANSITIONS = {
  [ISSUE_STATUS.REPORTED]: [ISSUE_STATUS.ASSIGNED],
  [ISSUE_STATUS.ASSIGNED]: [ISSUE_STATUS.INSPECTION_STARTED, ISSUE_STATUS.REPORTED],
  [ISSUE_STATUS.INSPECTION_STARTED]: [
    ISSUE_STATUS.MAINTENANCE_IN_PROGRESS,
    ISSUE_STATUS.WAITING_FOR_PARTS,
    ISSUE_STATUS.RESOLVED,
  ],
  [ISSUE_STATUS.MAINTENANCE_IN_PROGRESS]: [ISSUE_STATUS.WAITING_FOR_PARTS, ISSUE_STATUS.RESOLVED],
  [ISSUE_STATUS.WAITING_FOR_PARTS]: [ISSUE_STATUS.MAINTENANCE_IN_PROGRESS, ISSUE_STATUS.RESOLVED],
  [ISSUE_STATUS.RESOLVED]: [ISSUE_STATUS.CLOSED, ISSUE_STATUS.REOPENED],
  [ISSUE_STATUS.CLOSED]: [ISSUE_STATUS.REOPENED],
  [ISSUE_STATUS.REOPENED]: [ISSUE_STATUS.ASSIGNED, ISSUE_STATUS.INSPECTION_STARTED],
};

export const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];
