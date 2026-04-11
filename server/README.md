# StadiumIQ Backend

Simple Node.js/Express REST API for the StadiumIQ incident management system.

## Setup

```bash
cd server
npm install
npm run dev      # development (auto-restart)
npm start        # production
```

Server runs on **http://localhost:3001**

---

## API Endpoints

### Root — API reference
```
GET /
```

---

### 1. Fetch all incidents
```
GET /api/incidents
```
**Query params (all optional):**
| Param | Example | Description |
|---|---|---|
| `status` | `pending` | Filter by status |
| `severity` | `critical` | Filter by severity |
| `type` | `medical` | Filter by incident type |
| `zone` | `Zone A` | Filter by zone (partial match) |
| `limit` | `10` | Max results to return |

**Example:**
```
GET /api/incidents?status=pending&severity=critical
```

---

### 2. Fetch single incident
```
GET /api/incidents/:id
```

---

### 3. Report a new incident
```
POST /api/incidents
Content-Type: application/json
```
**Body:**
```json
{
  "type": "fight",
  "zone": "Zone A",
  "seat": "Row 12, Seat 4",
  "description": "Two fans fighting near entrance",
  "severity": "high",
  "anonymous": false,
  "reportedBy": "Fan App",
  "location": { "lat": 28.6139, "lng": 77.2090 },
  "media": []
}
```
**Required:** `type`, `zone`

**Valid types:** `fight`, `harassment`, `seat_dispute`, `medical`, `crowd_clustering`, `other`

**Valid severities:** `low`, `medium`, `high`, `critical`

---

### 4. Update incident status
```
PATCH /api/incidents/:id/status
Content-Type: application/json
```
**Body:**
```json
{ "status": "responding" }
```
**Valid statuses:** `pending`, `responding`, `on_scene`, `resolved`, `dismissed`

---

### 5. Assign incident to staff
```
PATCH /api/incidents/:id/assign
Content-Type: application/json
```
**Body:**
```json
{ "assignedTo": "Officer Kumar" }
```

---

### 6. Dismiss/delete an incident
```
DELETE /api/incidents/:id
```

---

### 7. Dashboard summary
```
GET /api/summary
```
Returns counts by status, severity, and type.

---

## Response format

All responses follow this shape:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

---

## Notes
- Uses in-memory store — data resets on server restart
- Seeded with 3 sample incidents on startup
- No database required for development/demo
- Swap `let incidents = []` with MongoDB/PostgreSQL for production
