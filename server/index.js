// ═══════════════════════════════════════════════════
//  StadiumIQ Backend — index.js
//  Simple Express API — no database required
// ═══════════════════════════════════════════════════

const express = require('express');
const cors    = require('cors');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── In-Memory Store ───────────────────────────────
// Seeded with realistic sample incidents so the API
// is useful immediately without any database setup.
let incidents = [
  {
    id: uuidv4(),
    type: 'crowd_clustering',
    zone: 'Zone A',
    seat: null,
    description: 'AI detected sudden density spike near North Stand entrance.',
    severity: 'critical',
    status: 'responding',
    anonymous: false,
    reportedBy: 'AI System',
    location: { lat: 28.6139, lng: 77.2090 },
    media: [],
    assignedTo: 'Team Alpha',
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'seat_dispute',
    zone: 'Block C',
    seat: 'Row 12, Seat 4',
    description: 'Two fans claiming same seat. Ticket verification needed.',
    severity: 'low',
    status: 'pending',
    anonymous: false,
    reportedBy: 'Fan App',
    location: { lat: 28.6140, lng: 77.2091 },
    media: [],
    assignedTo: null,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: uuidv4(),
    type: 'medical',
    zone: 'Gate A',
    seat: null,
    description: 'Fan reported dizziness near Gate A entry. Medical unit dispatched.',
    severity: 'high',
    status: 'resolved',
    anonymous: true,
    reportedBy: 'Anonymous',
    location: { lat: 28.6138, lng: 77.2089 },
    media: [],
    assignedTo: 'Medic Unit 1',
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60000).toISOString(),
  },
];

// ── Validation Helpers ────────────────────────────
const VALID_TYPES     = ['fight', 'harassment', 'seat_dispute', 'medical', 'crowd_clustering', 'other'];
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const VALID_STATUSES  = ['pending', 'responding', 'on_scene', 'resolved', 'dismissed'];

// ═══════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════

// ── Health check ─────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    service: 'StadiumIQ Incident API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      'GET  /api/incidents'              : 'Fetch all incidents (filterable)',
      'GET  /api/incidents/:id'          : 'Fetch single incident by ID',
      'POST /api/incidents'              : 'Report a new incident',
      'PATCH /api/incidents/:id/status'  : 'Update incident status',
      'PATCH /api/incidents/:id/assign'  : 'Assign incident to a staff member',
      'DELETE /api/incidents/:id'        : 'Dismiss/delete an incident',
      'GET  /api/summary'                : 'Dashboard summary stats',
    },
  });
});

// ─────────────────────────────────────────────────
//  1. GET /api/incidents
//  Fetch all incidents — supports query filters:
//    ?status=pending|responding|resolved
//    ?severity=low|medium|high|critical
//    ?type=fight|medical|...
//    ?zone=Zone+A
//    ?limit=20
// ─────────────────────────────────────────────────
app.get('/api/incidents', (req, res) => {
  const { status, severity, type, zone, limit } = req.query;
  let results = [...incidents];

  if (status)   results = results.filter(i => i.status === status);
  if (severity) results = results.filter(i => i.severity === severity);
  if (type)     results = results.filter(i => i.type === type);
  if (zone)     results = results.filter(i => i.zone.toLowerCase().includes(zone.toLowerCase()));

  // Sort newest first
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (limit) results = results.slice(0, parseInt(limit));

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

// ─────────────────────────────────────────────────
//  2. GET /api/incidents/:id — Single incident
// ─────────────────────────────────────────────────
app.get('/api/incidents/:id', (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found' });
  }
  res.json({ success: true, data: incident });
});

// ─────────────────────────────────────────────────
//  3. POST /api/incidents — Report a new incident
//
//  Required body fields:
//    type      — one of VALID_TYPES
//    zone      — e.g. "Zone A"
//    description — short description
//
//  Optional:
//    seat, severity, anonymous, reportedBy,
//    location { lat, lng }, media []
// ─────────────────────────────────────────────────
app.post('/api/incidents', (req, res) => {
  const {
    type,
    zone,
    seat        = null,
    description = '',
    severity    = 'medium',
    anonymous   = false,
    reportedBy  = 'Fan App',
    location    = null,
    media       = [],
  } = req.body;

  // Validate required fields
  if (!type || !zone) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: type and zone are required.',
    });
  }
  if (!VALID_TYPES.includes(type)) {
    return res.status(400).json({
      success: false,
      message: `Invalid type. Allowed: ${VALID_TYPES.join(', ')}`,
    });
  }
  if (!VALID_SEVERITIES.includes(severity)) {
    return res.status(400).json({
      success: false,
      message: `Invalid severity. Allowed: ${VALID_SEVERITIES.join(', ')}`,
    });
  }

  const now = new Date().toISOString();
  const newIncident = {
    id:          uuidv4(),
    type,
    zone,
    seat,
    description,
    severity,
    status:      'pending',
    anonymous:   Boolean(anonymous),
    reportedBy:  anonymous ? 'Anonymous' : reportedBy,
    location,
    media,
    assignedTo:  null,
    createdAt:   now,
    updatedAt:   now,
  };

  incidents.push(newIncident);

  console.log(`[NEW INCIDENT] ${newIncident.type} @ ${newIncident.zone} — ${newIncident.id}`);

  res.status(201).json({
    success: true,
    message: 'Incident reported successfully.',
    data: newIncident,
  });
});

// ─────────────────────────────────────────────────
//  4. PATCH /api/incidents/:id/status
//  Update incident status
//
//  Body: { status: "responding" | "on_scene" | "resolved" | "dismissed" }
// ─────────────────────────────────────────────────
app.patch('/api/incidents/:id/status', (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'status field is required.' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`,
    });
  }

  const idx = incidents.findIndex(i => i.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Incident not found.' });
  }

  incidents[idx].status    = status;
  incidents[idx].updatedAt = new Date().toISOString();

  console.log(`[STATUS UPDATE] ${req.params.id} → ${status}`);

  res.json({
    success: true,
    message: `Status updated to "${status}".`,
    data: incidents[idx],
  });
});

// ─────────────────────────────────────────────────
//  5. PATCH /api/incidents/:id/assign
//  Assign incident to a staff member
//
//  Body: { assignedTo: "Officer Kumar" }
// ─────────────────────────────────────────────────
app.patch('/api/incidents/:id/assign', (req, res) => {
  const { assignedTo } = req.body;

  if (!assignedTo) {
    return res.status(400).json({ success: false, message: 'assignedTo field is required.' });
  }

  const idx = incidents.findIndex(i => i.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Incident not found.' });
  }

  incidents[idx].assignedTo = assignedTo;
  incidents[idx].status     = incidents[idx].status === 'pending' ? 'responding' : incidents[idx].status;
  incidents[idx].updatedAt  = new Date().toISOString();

  console.log(`[ASSIGNED] ${req.params.id} → ${assignedTo}`);

  res.json({
    success: true,
    message: `Assigned to "${assignedTo}".`,
    data: incidents[idx],
  });
});

// ─────────────────────────────────────────────────
//  6. DELETE /api/incidents/:id — Dismiss incident
// ─────────────────────────────────────────────────
app.delete('/api/incidents/:id', (req, res) => {
  const idx = incidents.findIndex(i => i.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Incident not found.' });
  }
  const removed = incidents.splice(idx, 1)[0];
  console.log(`[DELETED] ${removed.id} — ${removed.type}`);
  res.json({ success: true, message: 'Incident dismissed.', data: removed });
});

// ─────────────────────────────────────────────────
//  7. GET /api/summary — Dashboard stats
// ─────────────────────────────────────────────────
app.get('/api/summary', (req, res) => {
  const total      = incidents.length;
  const pending    = incidents.filter(i => i.status === 'pending').length;
  const responding = incidents.filter(i => i.status === 'responding').length;
  const onScene    = incidents.filter(i => i.status === 'on_scene').length;
  const resolved   = incidents.filter(i => i.status === 'resolved').length;
  const critical   = incidents.filter(i => i.severity === 'critical').length;
  const anonymous  = incidents.filter(i => i.anonymous).length;

  // Count by type
  const byType = VALID_TYPES.reduce((acc, t) => {
    acc[t] = incidents.filter(i => i.type === t).length;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      total,
      byStatus: { pending, responding, on_scene: onScene, resolved },
      critical,
      anonymous,
      byType,
      lastUpdated: new Date().toISOString(),
    },
  });
});

// ─────────────────────────────────────────────────
//  404 catch-all
// ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ── Start Server ──────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ⚡ StadiumIQ Backend running');
  console.log(`  🌐 http://localhost:${PORT}`);
  console.log(`  📋 API docs: http://localhost:${PORT}/`);
  console.log('');
});
