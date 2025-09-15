const express = require('express');
const z = require('zod');
const { nanoid } = require('nanoid');
const db = require('../db');

const router = express.Router();

const itinerarySchema = z.object({
  title: z.string().min(1),
  days: z.array(z.object({
    date: z.string().min(1),
    notes: z.string().optional().default('')
  })).min(1)
});

router.get('/itinerary/new', (_req, res) => {
  res.render('itinerary_form', { title: 'New Itinerary' });
});

router.post('/itinerary', (req, res, next) => {
  try {
    // Expect form fields: title, date[], notes[]
    const raw = {
      title: req.body.title,
      days: (Array.isArray(req.body.date) ? req.body.date : [req.body.date]).map((d, i) => ({
        date: d,
        notes: Array.isArray(req.body.notes) ? (req.body.notes[i] || '') : (req.body.notes || '')
      }))
    };
    const data = itinerarySchema.parse(raw);
    const code = nanoid(8);
    db.prepare('INSERT INTO itineraries (code, title, payload, createdAt) VALUES (?,?,?,datetime("now"))')
      .run(code, data.title, JSON.stringify(data));
    res.redirect(`/i/${code}`);
  } catch (e) { next(e); }
});

// Unified share route for itineraries & readiness snapshots
router.get('/i/:code', (req, res, next) => {
  const code = req.params.code;

  // Try itinerary first
  const it = db.prepare('SELECT title, payload FROM itineraries WHERE code = ?').get(code);
  if (it) {
    const parsed = JSON.parse(it.payload);
    return res.render('itinerary_view', { title: it.title, days: parsed.days, code });
  }

  // Then snapshots (e.g., readiness)
  const snap = db.prepare('SELECT type, payload FROM snapshots WHERE code = ?').get(code);
  if (snap) {
    const payload = JSON.parse(snap.payload);
    if (snap.type === 'readiness') {
      return res.render('readiness_view_shared', { title: 'Readiness Snapshot', payload, code });
    }
  }

  return next(); // 404
});

module.exports = router;
