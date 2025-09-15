const request = require('supertest');
const app = require('../app');

test('healthz ok', async () => {
  const res = await request(app).get('/healthz');
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
});

test('destinations list loads', async () => {
  const res = await request(app).get('/destinations');
  expect(res.status).toBe(200);
  expect(res.text).toMatch(/Destinations/);
});

test('readiness form loads', async () => {
  const res = await request(app).get('/readiness');
  expect(res.status).toBe(200);
  expect(res.text).toMatch(/Travel Readiness/);
});

test('itinerary form loads', async () => {
  const res = await request(app).get('/itinerary/new');
  expect(res.status).toBe(200);
  expect(res.text).toMatch(/Create Itinerary/);
});
