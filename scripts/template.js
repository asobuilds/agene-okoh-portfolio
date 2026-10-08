function computeReadingTime(html) {
  const text = html.replace(/<[^>]*>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function splitBodyIntoCards(bodyHtml) {
  const sections = bodyHtml.split(/\n## /);
  return sections.map((section, i) => {
    if (i === 0) return section;
    return '## ' + section;
  }).filter(Boolean).map(section => {
    return `<div class="card" style="margin-bottom: 24px;">${section}</div>`;
  }).join('\n');
}

function renderPost(post) {
  const readingTime = computeReadingTime(post.body);
  const formattedDate = formatDate(post.date);
  const eyebrow = `${formattedDate} · ${post.category} · ${readingTime}`;
  const tagsHtml = post.tags.map(t => `<span class="tag">${t}</span>`).join('');
  const heroImageHtml = post.heroImage
    ? `<div class="card" style="margin-bottom: 24px;"><img src="../${post.heroImage}" alt="${post.title}" style="width:100%;border-radius:var(--radius);" /></div>`
    : '';

  const bodyCards = splitBodyIntoCards(post.body);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="description" content="${post.description}" />
  <title>${post.title} — Agene S. Okoh</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <link rel="alternate" type="application/rss+xml" title="Agene S. Okoh — Build Log" href="/feed.xml" />
</head>
<body data-page="blog" data-depth="1">
  <main class="page" id="main">
    <article class="section container fade-in">
      <div class="section-header">
        <div class="section-eyebrow">${eyebrow}</div>
        <h1>${post.title}</h1>
        <p style="font-size: 1.1rem; color: var(--text-muted);">${post.description}</p>
        <div class="tags" style="margin-top: 20px;">
          ${tagsHtml}
        </div>
      </div>

      ${heroImageHtml}
      ${bodyCards}

      <div class="card" style="margin: 24px 0; padding: 28px; background: var(--accent-soft); border-left: 3px solid var(--accent); border-radius: 0 var(--radius) var(--radius) 0;">
        <h3 style="margin-bottom: 8px;">Enjoying this?</h3>
        <p style="margin-bottom: 16px;">Get new build logs and essays straight to your inbox. One email when I publish.</p>
        <form action="https://buttondown.com/api/emails/embed-subscribe/agene" method="post" style="display:flex; gap:8px; flex-wrap:wrap; max-width:100%;">
          <input type="email" name="email" placeholder="you@example.com" required style="flex:1; min-width:200px;" />
          <input type="hidden" value="1" name="embed" />
          <button type="submit" class="btn btn-primary" style="white-space:nowrap;">Subscribe</button>
        </form>
      </div>

      <div class="giscus-wrapper">
        <h3>Join the discussion</h3>
        <p>Comments are powered by GitHub Discussions. Sign in with your GitHub account to reply.</p>
        <script src="https://giscus.app/client.js"
          data-repo="asobuilds/asobuilds.github.io"
          data-repo-id="YOUR_REPO_ID"
          data-category="Announcements"
          data-category-id="YOUR_CATEGORY_ID"
          data-mapping="pathname"
          data-strict="0"
          data-reactions-enabled="1"
          data-emit-metadata="0"
          data-input-position="top"
          data-theme="preferred_color_scheme"
          data-lang="en"
          crossorigin="anonymous"
          async>
        </script>
      </div>

      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top: 32px;">
        <a href="../projects.html" class="btn btn-primary">See all projects →</a>
        <a href="../contact.html" class="btn btn-secondary">Get in touch →</a>
        <a href="index.html" class="btn btn-ghost">← All writing</a>
      </div>
    </article>
  </main>
  <script src="../assets/js/script.js"></script>
</body>
</html>`;
}

module.exports = { renderPost, computeReadingTime, formatDate, slugify };