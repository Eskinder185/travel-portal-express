const express = require('express');
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const slugify = require('slugify');

const router = express.Router();
const CONTENT_DIR = path.join(__dirname, '..', 'content');

function loadAll() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  return files.map(f => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, f), 'utf-8');
    const { data, content } = matter(raw);
    const slug = (data.slug) || slugify(data.title || f.replace(/\.md$/, ''), { lower: true });
    return {
      slug,
      title: data.title || slug,
      tags: data.tags || [],
      summary: data.summary || '',
      body: content
    };
  });
}

router.get('/', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const tag = (req.query.tag || '').toLowerCase();
  const items = loadAll().filter(it => {
    const hitQ = !q || it.title.toLowerCase().includes(q) || it.summary.toLowerCase().includes(q) || it.body.toLowerCase().includes(q);
    const hitT = !tag || it.tags.map(t => t.toLowerCase()).includes(tag);
    return hitQ && hitT;
  });
  res.render('destination_list', { title: 'Destinations', q, tag, items });
});

router.get('/:slug', (req, res, next) => {
  const items = loadAll();
  const it = items.find(x => x.slug === req.params.slug);
  if (!it) return next();
  const html = marked.parse(it.body);
  res.render('destination', { title: it.title, tags: it.tags, summary: it.summary, html });
});

module.exports = router;
