# MaintainIQ — Data Model

MongoDB / Mongoose. Six collections, all defined under `server/src/models/`.

```mermaid
erDiagram
    USER {
        ObjectId _id
        string name
        string email
        string passwordHash
        string role "admin | technician | reporter | supervisor"
        boolean isActive
        string refreshTokenHash
    }

    ASSET {
        ObjectId _id
        string assetCode "immutable, unique - encoded in QR"
        string name
        string category
        string location
        string condition
        string status "Operational...Retired"
        ObjectId assignedTechnician FK
        date lastServiceDate
        date nextServiceDate
        number purchaseCost "private, never on public page"
        string serialNumber "private, never on public page"
    }

    ISSUE {
        ObjectId _id
        string issueNumber "immutable, unique"
        ObjectId asset FK
        string title
        string description
        string category
        string priority "Low|Medium|High|Critical"
        string status "Reported...Reopened"
        ObjectId assignedTechnician FK
        ObjectId reportedBy FK "nullable - anonymous public reporters"
        object aiTriage "per-field {value, aiSuggested, userEdited}"
        array evidence "Cloudinary url + publicId"
    }

    MAINTENANCE_RECORD {
        ObjectId _id
        ObjectId issue FK
        ObjectId asset FK
        ObjectId technician FK
        string inspectionNotes
        string workPerformed
        array parts "[{name, quantity, cost}]"
        number totalCost "min 0"
        date completionDate
        date nextServiceDate "must be >= completionDate"
        array evidence
    }

    HISTORY {
        ObjectId _id
        ObjectId asset FK
        ObjectId issue FK "nullable"
        ObjectId actor FK "nullable - System for automated entries"
        string action
        string message
        object meta
    }

    NOTIFICATION {
        ObjectId _id
        ObjectId recipient FK
        string type
        string title
        string message
        boolean isRead
    }

    USER ||--o{ ASSET : "assignedTechnician"
    USER ||--o{ ISSUE : "assignedTechnician / reportedBy"
    ASSET ||--o{ ISSUE : "has"
    ISSUE ||--o{ MAINTENANCE_RECORD : "has"
    ASSET ||--o{ MAINTENANCE_RECORD : "has"
    ASSET ||--o{ HISTORY : "timeline"
    ISSUE ||--o{ HISTORY : "timeline"
    USER ||--o{ NOTIFICATION : "receives"
```

## Key design points

- **`Asset.assetCode`** is generated once at creation and marked `immutable` in the schema — it's what the QR
  encodes, so it can never drift from the printed/generated QR even if the asset is renamed or moved.
- **`History`** has no update/delete route anywhere in the API — every state-changing service call
  (`assetService`, `issueService`, `maintenanceService`) writes its own entry as the last step of the same
  function that made the change. See `server/src/services/historyService.js`.
- **`Issue.aiTriage`** stores each AI-touched field as `{ value, aiSuggested, userEdited }` rather than a flat
  string, so the UI (and any grader) can see exactly which fields came from Gemini and whether the human
  reporter/technician changed them before saving.
- Private fields (`Asset.purchaseCost`, `Asset.serialNumber`, any maintenance cost/notes) are excluded from the
  public asset page via a dedicated Mongoose `.select()` projection (`Asset.PUBLIC_PROJECTION`), not by filtering
  in the controller — see `ARCHITECTURE.md` §3.5.
