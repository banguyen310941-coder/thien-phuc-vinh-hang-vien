const fs = require('node:fs');
const path = require('node:path');
const { getNews } = require('../lib/news-store');
const { renderNewsIndex } = require('../lib/news-index');

module.exports = (req, res) => {
  try {
    const template = fs.readFileSync(path.join(__dirname, '..', 'tin-tuc.html'), 'utf8');
    const html = renderNewsIndex(template, getNews().items);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
    return res.status(200).send(html);
  } catch (error) {
    console.error('news-index-render-error', error);
    return res.status(500).send('Không thể tải danh sách bài viết lúc này.');
  }
};
