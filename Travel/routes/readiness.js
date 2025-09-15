const express = require('express');
const z = require('zod');
const dayjs = require('dayjs');
const { nanoid } = require('nanoid');
const db = require('../db');
const averages = require('../data/averages.json');

const router = express.Router();

const schema = z.object({
  city: z.string().min(2).transform(s => s.toLowerCase()),
  start: z.string().refine(s => !isNaN(Date.parse(s)), "Invalid start date"),
  end: z.string().refine(s => !isNaN(Date.parse(s)), "Invalid end date"),
  budgetUSD: z.coerce.number().positive()
});

function daysBetween(a, b) {
  const start = dayjs(a).startOf('day');
  const end = dayjs(b).startOf('day');
  return Math.max(1, end.diff(start, 'day') + 1);
}

// Fake 5-day weather using monthly averages
function fiveDayForecast(city, startDate) {
  const start = dayjs(startDate);
  const monthIdx = start.month(); // 0..11
  const data = averages[city].months[monthIdx] || averages[city].months[0];
  const mid = Math.round((data.tHigh + data.tLow) / 2);
  const out = [];
  for (let i = 0; i < 5; i++) {
    out.push({
      date: start.add(i, 'day').format('YYYY-MM-DD'),
      high: data.tHigh + ((i % 2) ? 1 : 0),
      low: data.tLow - ((i % 2) ? 1 : 0),
      feels: mid + (i - 2), // tiny variation
      rainChancePct: data.rainPct
    });
  }
  return out;
}

router.get('/readiness', (req, res) => {
  res.render('readiness_form', { title: 'Travel Readiness' });
});

router.post('/readiness/calc', (req, res, next) => {
  try {
    const { city, start, end, budgetUSD } = schema.parse(req.body);
    if (!averages[city]) return res.status(404).render('error', { message: 'Unknown city' });

    const days = daysBetween(start, end);
    const daily = averages[city].dailyCostUSD;
    const expectedSpend = daily * days;
    const underBudget = budgetUSD >= expectedSpend;
    const forecast = fiveDayForecast(city, start);

    res.render('readiness_view', {
      title: 'Readiness Result',
      city,
      start,
      end,
      days,
      daily,
      expectedSpend,
      budgetUSD,
      underBudget,
      forecast
    });
  } catch (e) { next(e); }
});

router.post('/readiness/save', (req, res, next) => {
  try {
    const payload = req.body; // contains fields from the calc form (you can pass hidden inputs)
    const code = nanoid(8);
    const stmt = db.prepare('INSERT INTO snapshots (code, type, payload, createdAt) VALUES (?,?,?,datetime("now"))');
    stmt.run(code, 'readiness', JSON.stringify(payload));
    res.redirect(`/i/${code}`);
  } catch (e) { next(e); }
});

module.exports = router;
