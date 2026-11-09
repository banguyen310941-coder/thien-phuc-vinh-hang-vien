const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { getNews } = require('../lib/news-store');
const { getPublishedSummaries, renderNewsIndex } = require('../lib/news-index');
const newsPage = require('../api/news-page');
const articlePage = require('../api/article');
const sitemap = require('../api/sitemap');
const config = require('../vercel.json');
const base = 'https://www.thienphucvinhhangvien.net';
const template = fs.readFileSync(path.join(__dirname, '..', 'tin-tuc.html'), 'utf8');
const published = getPublishedSummaries(getNews().items);

function response() {
  return {
    code: 200, headers: {}, body: '',
    status(code) { this.code = code; return this; },
    setHeader(key, value) { this.headers[key] = value; },
    send(body) { this.body = body; return this; }
  };
}

test('news index serves every published article without JavaScript or /api/news', () => {
  const res = response();
  newsPage({}, res);
  assert.equal(res.code, 200);
  assert.equal(res.headers['Content-Type'], 'text/html; charset=utf-8');
  assert.equal((res.body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').match(/class="news-card"/g) || []).length, published.length);
  for (const item of published) assert.ok(res.body.includes(`href="/tin-tuc/${item.id}"`), item.id);
  assert.equal((res.body.match(/<h1[ >]/g) || []).length, 1);
  assert.equal((res.body.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(res.body.includes(`href="${base}/tin-tuc"`));
  assert.ok(!res.body.includes("fetch('/api/news"));
  const bootstrap = res.body.match(/id="newsBootstrap" type="application\/json">([\s\S]*?)<\/script>/)[1];
  assert.deepEqual(JSON.parse(bootstrap), published);
  for (const script of res.body.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(script[1]);
});

test('listing data excludes unpublished articles, unsafe IDs and full article bodies', () => {
  const items = getPublishedSummaries([
    { id: 'old', status: 'published', publishedAt: '2026-01-01', title: 'Old', content: 'Full body' },
    { id: 'new', status: 'published', publishedAt: '2026-02-01', title: 'New' },
    { id: 'draft', status: 'draft', title: 'Draft' },
    { id: '../invalid', status: 'published', title: 'Invalid' }
  ]);
  assert.deepEqual(items.map(item => item.id), ['new', 'old']);
  assert.ok(items.every(item => !Object.hasOwn(item, 'content') && !Object.hasOwn(item, 'status')));
});

test('HTML and JSON bootstrap safely preserve article text', () => {
  const title = '</script><script>alert("x")</script> & text';
  const html = renderNewsIndex(template, [{ id: 'safe', status: 'published', title }]);
  assert.ok(!html.includes(title));
  assert.ok(html.includes('&lt;/script&gt;'));
  const data = html.match(/id="newsBootstrap" type="application\/json">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(data)[0].title, title);
  assert.throws(() => renderNewsIndex('<html></html>', []), /render markers/);
  assert.ok(renderNewsIndex(template, []).includes('Chưa có bài viết được xuất bản.'));
});

test('client filters work from embedded summaries without another request', () => {
  const html = renderNewsIndex(template, getNews().items);
  const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const box = { innerHTML: '' };
  const search = { value: '' };
  const topics = ['all', 'mo-phan', 'cham-soc'].map(topic => ({
    dataset: { topic }, classList: { add() {}, remove() {} }
  }));
  const document = {
    querySelector(selector) {
      return { '#newsDynamic': box, '#newsSearch': search, '#newsBootstrap': { textContent: JSON.stringify(published) } }[selector];
    },
    querySelectorAll() { return topics; }
  };
  vm.runInNewContext(source, { document });
  const count = () => (box.innerHTML.match(/class="news-card"/g) || []).length;
  search.oninput();
  assert.equal(count(), published.length);
  search.value = 'xe lăn'; search.oninput(); assert.equal(count(), 1);
  search.value = 'not-a-real-query'; search.oninput(); assert.equal(count(), 0);
  assert.ok(box.innerHTML.includes('Không tìm thấy bài viết phù hợp.'));
  search.value = ''; search.oninput(); assert.equal(count(), published.length);
  topics[1].onclick(); assert.ok(count() > 0 && count() < published.length);
  topics[0].onclick(); assert.equal(count(), published.length);
  topics[0].onclick(); assert.equal(count(), published.length);
});

test('canonical news index rewrite precedes article rewrite; old broken links have permanent destinations', () => {
  const index = config.rewrites.findIndex(route => route.source === '/tin-tuc');
  assert.ok(index >= 0 && index < config.rewrites.findIndex(route => route.source === '/tin-tuc/:id'));
  assert.equal(config.rewrites[index].destination, '/api/news-page');
  for (const [from, to] of [['/khu-mo-gia-toc', '/khu-gia-toc'], ['/tin-tuc/gia-mo-don', '/tin-tuc/gia-mo-don-20260910']]) {
    assert.ok(config.redirects.some(route => route.source === from && route.destination === to && route.permanent));
  }
});

test('all sitemap pages render with matching canonical, one H1 and valid JSON-LD', () => {
  const res = response();
  sitemap({}, res);
  assert.equal(res.code, 200);
  const urls = [...res.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
  assert.equal(new Set(urls).size, urls.length);
  assert.equal(urls.length, published.length + 11);
  const paths = new Set(urls.map(url => url.slice(base.length)));
  for (const url of urls) {
    const pathname = url.slice(base.length);
    let html;
    if (pathname.startsWith('/tin-tuc/')) {
      const article = response();
      articlePage({ query: { id: pathname.slice('/tin-tuc/'.length) } }, article);
      assert.equal(article.code, 200, pathname);
      html = article.body;
    } else if (pathname === '/tin-tuc') html = renderNewsIndex(template, getNews().items);
    else html = fs.readFileSync(path.join(__dirname, '..', pathname === '/' ? 'index.html' : pathname.slice(1) + '.html'), 'utf8');
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, pathname);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1, pathname);
    assert.ok(html.includes(`rel="canonical" href="${url}"`), pathname);
    for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(script[1]);
    for (const link of html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').matchAll(/<a\b[^>]*href="(\/[^"]*)"/g)) {
      const destination = link[1].split(/[?#]/)[0];
      assert.ok(paths.has(destination), `${pathname} links to noncanonical/missing ${destination}`);
    }
  }
  const missing = response();
  articlePage({ query: { id: 'nonexistent-seo-test' } }, missing);
  assert.equal(missing.code, 404);
});
