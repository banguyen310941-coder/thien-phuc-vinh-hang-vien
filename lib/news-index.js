const fallback = '/assets/uploads/overview-1787919202977.jpg';

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

function getPublishedSummaries(items) {
  return items
    .filter(item => item && item.status === 'published' && /^[a-z0-9-]+$/.test(String(item.id || '')))
    .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')))
    .map(item => ({
      id: item.id,
      title: item.title || '',
      excerpt: item.excerpt || '',
      keyword: item.keyword || '',
      publishedAt: item.publishedAt || '',
      cover: item.cover || (item.images || [])[0] || fallback
    }));
}

function renderCards(items) {
  if (!items.length) return '<p class="news-empty">Chưa có bài viết được xuất bản.</p>';
  return items.map(item => {
    const url = '/tin-tuc/' + encodeURIComponent(item.id);
    const date = String(item.publishedAt).slice(0, 10);
    const dateMarkup = /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? `<time class="news-date" datetime="${date}">${date.split('-').reverse().join('.')}</time>`
      : '';
    return `<article class="news-card"><a class="news-card__image" href="${url}" aria-label="${escapeHtml(item.title)}"><img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy"></a><div class="news-card__body">${dateMarkup}<h2><a href="${url}">${escapeHtml(item.title)}</a></h2><p>${escapeHtml(item.excerpt)}</p><a class="text-link" href="${url}">Xem chi tiết →</a></div></article>`;
  }).join('');
}

function renderNewsIndex(template, items) {
  const summaries = getPublishedSummaries(items);
  const grid = /<!-- NEWS_GRID_START -->[\s\S]*?<!-- NEWS_GRID_END -->/;
  if (!grid.test(template) || !template.includes('<!-- NEWS_BOOTSTRAP -->')) {
    throw new Error('News template is missing its render markers');
  }
  // Embedded data is limited to already public listing fields, not complete articles.
  // Escape '<' so article text cannot terminate the non-executable JSON script.
  const bootstrap = JSON.stringify(summaries).replace(/</g, '\\u003c');
  return template
    .replace(grid, () => `<div id="newsDynamic" class="news-grid">${renderCards(summaries)}</div>`)
    .replace('<!-- NEWS_BOOTSTRAP -->', () => `<script id="newsBootstrap" type="application/json">${bootstrap}</script>`);
}

module.exports = { getPublishedSummaries, renderCards, renderNewsIndex };
