const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');
const { renderPost, computeReadingTime, formatDate, slugify } = require('./template.js');

const POSTS_DIR = path.join(__dirname, '../blog/posts');
const BLOG_DIR = path.join(__dirname, '../blog');
const ROOT_DIR = path.join(__dirname, '..');

const LEGACY_POST_FILES = [
  'map-and-territory.html',
  'building-devcraft-career.html',
  'honest-state-of-my-work.html',
  'building-my-portfolio.html',
  'leadclear-client-story.html',
  'building-nativityguard.html',
  'why-go-for-backends.html',
  'ai-for-agriculture.html',
];

const PROJECTS = [
  { title: 'DevCraft Career', url: '/projects/devcraft-career', date: 'Project', tags: 'react python jobs', desc: 'CV builder + AI job matcher — deployed and in use.' },
  { title: 'NativityGuard', url: '/projects/nativityguard', date: 'Project', tags: 'go react postgresql GIS civic tech', desc: 'Digital public-safety platform for rural Nigerian communities.' },
  { title: 'Plant Assistant', url: '/projects/plant-assistant', date: 'Project', tags: 'python AI ML agriculture', desc: 'AI plant identification for small-scale farmers.' },
  { title: 'LeadClear Journal', url: '/projects/leadclear-journal', date: 'Project', tags: 'landing page client selar', desc: 'Client landing page with payment + funnel integration.' },
  { title: 'My Creative Partner', url: '/projects/my-creative-partner', date: 'Project', tags: '3D AI voice collaborative', desc: '3D philosophical game with text/voice prompting.' },
  { title: 'Portfolio Ecosystem', url: '/projects/portfolio-ecosystem', date: 'Project', tags: 'HTML CSS SEO design system', desc: 'This site — multi-page ecosystem with blog, SEO, and analytics.' },
];

function parseMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = matter(content);
  const html = marked.parse(body);
  return { frontmatter: data, body: html };
}

function parseLegacyHtml(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  
  // Extract meta description
  const descMatch = html.match(/<meta name="description" content="([^"]*)" \/>/);
  const description = descMatch ? descMatch[1].replace(/&/g, '&').replace(/&apos;/g, "'") : '';
  
  // Extract title from <title> tag
  const titleMatch = html.match(/<title>([^<]*) — Agene S\. Okoh<\/title>/);
  let title = titleMatch ? titleMatch[1].replace(/&/g, '&').replace(/&apos;/g, "'") : '';
  
  // Extract eyebrow (date + category + reading time)
  const eyebrowMatch = html.match(/<div class="section-eyebrow">([^<]*)<\/div>/);
  const eyebrow = eyebrowMatch ? eyebrowMatch[1] : '';
  
  // Parse eyebrow: "2026 · Essay · 9 min read" or "Sep 14 2026 · Essay · 9 min read"
  let date = '2025-09-01';
  let category = 'Engineering';
  if (eyebrow) {
    const parts = eyebrow.split(' · ');
    if (parts.length >= 2) {
      const datePart = parts[0].trim();
      const fullDateMatch = datePart.match(/^(\w{3}) (\d{1,2}) (\d{4})$/);
      if (fullDateMatch) {
        const [, month, day, year] = fullDateMatch;
        const monthNum = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(month) + 1;
        date = `${year}-${String(monthNum).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      } else if (/^\d{4}$/.test(datePart)) {
        date = `${datePart}-01-01`;
      }
      category = parts[1].trim();
    }
  }
  
  // Extract tags
  const tagsMatch = html.match(/<div class="tags" style="margin-top: 20px;">([\s\S]*?)<\/div>/);
  let tags = [];
  if (tagsMatch) {
    const tagMatches = tagsMatch[1].match(/<span class="tag">([^<]*)<\/span>/g);
    if (tagMatches) {
      tags = tagMatches.map(t => t.replace(/<\/?span[^>]*>/g, ''));
    }
  }
  
  // Extract the first paragraph after h1 as description fallback
  const firstPMatch = html.match(/<h1[^>]*>[^<]*<\/h1>\s*<p[^>]*>([^<]*)<\/p>/);
  const firstPara = firstPMatch ? firstPMatch[1].replace(/&/g, '&').replace(/&apos;/g, "'") : '';
  
  // If title is empty, try to get from h1
  if (!title) {
    const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/);
    title = h1Match ? h1Match[1].replace(/&/g, '&').replace(/&apos;/g, "'") : '';
  }
  
  return {
    title,
    date,
    category,
    description: description || firstPara,
    tags,
    slug: path.basename(filePath, '.html'),
  };
}

function getAllPosts() {
  const markdownPosts = [];
  const legacyPosts = [];
  
  // Process markdown posts
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(POSTS_DIR, file);
      const { frontmatter, body } = parseMarkdownFile(filePath);
      
      const slug = frontmatter.slug || path.basename(file, '.md');
      const isDraft = frontmatter.draft === true;
      
      markdownPosts.push({
        slug,
        title: frontmatter.title,
        date: frontmatter.date,
        category: frontmatter.category || 'Engineering',
        description: frontmatter.description || '',
        heroImage: frontmatter.heroImage || null,
        tags: frontmatter.tags || [],
        author: frontmatter.author || 'Agene S. Okoh',
        body: body,
        source: 'markdown',
        isDraft,
      });
    }
  }
  
  // Process legacy posts - ONLY read metadata, NEVER write HTML
  for (const legacyFile of LEGACY_POST_FILES) {
    const slug = legacyFile.replace('.html', '');
    const hasMarkdown = markdownPosts.some(p => p.slug === slug);
    if (!hasMarkdown) {
      const filePath = path.join(BLOG_DIR, legacyFile);
      if (fs.existsSync(filePath)) {
        const parsed = parseLegacyHtml(filePath);
        legacyPosts.push({
          ...parsed,
          heroImage: null,
          author: 'Agene S. Okoh',
          body: '',
          source: 'legacy',
          legacyFile,
          isDraft: false,
        });
      }
    }
  }
  
  // All posts for index generation (published only)
  const allPublishedPosts = [...markdownPosts.filter(p => !p.isDraft), ...legacyPosts];
  allPublishedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // All markdown posts (including drafts) for HTML generation
  const markdownPostsAll = [...markdownPosts];
  
  return { markdownPostsAll, publishedPosts: allPublishedPosts };
}

function buildPostHtml(post) {
  const html = renderPost(post);
  const outputPath = path.join(BLOG_DIR, `${post.slug}.html`);
  fs.writeFileSync(outputPath, html);
  console.log(`Built: ${post.slug}.html${post.isDraft ? ' (draft)' : ''}`);
}

function buildIndexHtml(posts) {
  const cardHtml = posts.map(post => {
    const formattedDate = formatDate(post.date);
    const category = post.category;
    const tagsHtml = post.tags.map(t => `<span class="tag">${t}</span>`).join('');
    const emoji = getEmojiForCategory(category);
    
    return `        <a href="${post.slug}.html" class="project-card">
          <div class="project-thumb">${emoji}</div>
          <div class="project-body">
            <div class="section-eyebrow" style="margin-bottom:6px;">${formattedDate} · ${category}</div>
            <h3>${post.title}</h3>
            <p>${post.description || 'Building in public — architecture decisions, lessons learned, and research.'}</p>
            <div class="tags">${tagsHtml}</div>
            <span class="project-link">Read post →</span>
          </div>
        </a>`;
  }).join('\n');

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="description" content="Writing by Agene S. Okoh — building in public, engineering notes, and research on AI, Go, and full-stack systems." />
  <title>Writing — Agene S. Okoh</title>
  <link rel="stylesheet" href="../assets/css/style.css" />
  <link rel="alternate" type="application/rss+xml" title="Agene S. Okoh — Build Log" href="/feed.xml" />
</head>
<body data-page="blog" data-depth="1">
  <main class="page" id="main">
    <section class="section container fade-in">
      <div class="section-header">
        <div class="section-eyebrow">Writing · Build Log</div>
        <h1>Writing</h1>
        <p style="font-size: 1.1rem; max-width: 640px;">Notes from building real products — architecture decisions, lessons learned, and research I'm currently exploring.</p>
      </div>

      <div class="projects-grid">
${cardHtml}
      </div>

      <div class="card" style="margin-top: 40px; text-align:center; padding: 36px 24px; border-style: dashed;">
        <h3>More posts coming soon</h3>
        <p style="max-width: 480px; margin: 8px auto 20px;">I'm documenting every project as I build it. New posts drop weekly.</p>
        <a href="../contact.html" class="btn btn-secondary">Get notified →</a>
      </div>
            <!-- NEWSLETTER -->
      <div class="card" style="margin-top: 40px; padding: 36px 28px; background: linear-gradient(135deg, var(--accent-soft), var(--success-soft)); border: 1px solid var(--accent);">
        <div class="section-eyebrow">Stay in the loop</div>
        <h3 style="margin-bottom: 8px;">Get new posts in your inbox</h3>
        <p style="max-width: 480px; margin: 0 auto 20px;">One email when I publish. No spam, no fluff. Unsubscribe anytime.</p>
        <form action="https://buttondown.com/api/emails/embed-subscribe/agene" method="post" class="embeddable-buttondown-form" style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; max-width:520px; margin:0 auto;">
          <input type="email" name="email" placeholder="you@example.com" required style="flex:1; min-width:220px;" />
          <input type="hidden" value="1" name="embed" />
          <button type="submit" class="btn btn-primary">Subscribe →</button>
        </form>
      </div>
    </section>
  </main>
  <script src="../assets/js/script.js"></script>
  <script defer src="/_vercel/insights/script.js"></script>
</body>
</html>`;

  const outputPath = path.join(BLOG_DIR, 'index.html');
  fs.writeFileSync(outputPath, indexHtml);
  console.log('Built: blog/index.html');
}

function getEmojiForCategory(category) {
  const emojis = {
    'Engineering': '⚙️',
    'Build Log': '📦',
    'Essay': '🗺️',
    'Research': '🌱',
    'Client Work': '📘',
    'Civic Tech': '🛡️',
  };
  return emojis[category] || '📝';
}

function buildSearchIndex(posts) {
  const searchEntries = [];

  for (const post of posts) {
    const formattedDate = formatDate(post.date);
    searchEntries.push({
      title: post.title,
      url: `/blog/${post.slug}`,
      date: formattedDate,
      tags: post.tags.join(' '),
      desc: post.description || post.title,
    });
  }

  for (const project of PROJECTS) {
    searchEntries.push({
      title: project.title,
      url: project.url,
      date: project.date,
      tags: project.tags,
      desc: project.desc,
    });
  }

  const outputPath = path.join(BLOG_DIR, 'search-index.json');
  fs.writeFileSync(outputPath, JSON.stringify(searchEntries, null, 2));
  console.log('Built: blog/search-index.json');
}

function buildFeedXml(posts) {
  const items = posts.map(post => {
    const pubDate = new Date(post.date).toUTCString();
    const link = `https://agene-okoh.vercel.app/blog/${post.slug}`;
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  }).join('\n');

  const lastBuildDate = new Date().toUTCString();

  const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Agene S. Okoh — Build Log</title>
    <link>https://agene-okoh.vercel.app/blog</link>
    <description>Notes from building real products — architecture, lessons, and research.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="https://agene-okoh.vercel.app/feed.xml" rel="self" type="application/rss+xml" />

${items}
  </channel>
</rss>`;

  const outputPath = path.join(ROOT_DIR, 'feed.xml');
  fs.writeFileSync(outputPath, feedXml);
  console.log('Built: feed.xml');
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&apos;');
}

function buildSitemapXml(posts) {
  const staticUrls = [
    { url: 'https://agene-okoh.vercel.app/', priority: '1.0' },
    { url: 'https://agene-okoh.vercel.app/about', priority: '0.9' },
    { url: 'https://agene-okoh.vercel.app/experience', priority: '0.8' },
    { url: 'https://agene-okoh.vercel.app/projects', priority: '0.9' },
    { url: 'https://agene-okoh.vercel.app/projects/devcraft-career', priority: '0.8' },
    { url: 'https://agene-okoh.vercel.app/projects/portfolio-ecosystem', priority: '0.9' },
    { url: 'https://agene-okoh.vercel.app/projects/nativityguard', priority: '0.8' },
    { url: 'https://agene-okoh.vercel.app/projects/plant-assistant', priority: '0.7' },
    { url: 'https://agene-okoh.vercel.app/projects/leadclear-journal', priority: '0.7' },
    { url: 'https://agene-okoh.vercel.app/projects/my-creative-partner', priority: '0.7' },
    { url: 'https://agene-okoh.vercel.app/services', priority: '0.9' },
    { url: 'https://agene-okoh.vercel.app/process', priority: '0.7' },
    { url: 'https://agene-okoh.vercel.app/blog', priority: '0.9' },
    { url: 'https://agene-okoh.vercel.app/contact', priority: '0.9' },
  ];

  const blogUrls = posts.map(post => ({
    url: `https://agene-okoh.vercel.app/blog/${post.slug}`,
    priority: '0.9',
  }));

  const allUrls = [...staticUrls, ...blogUrls];

  const urlEntries = allUrls.map(u => `  <url><loc>${u.url}</loc><priority>${u.priority}</priority></url>`).join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  const outputPath = path.join(ROOT_DIR, 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemapXml);
  console.log('Built: sitemap.xml');
}

function main() {
  console.log('🔨 Building blog...\n');
  
  const { markdownPostsAll, publishedPosts } = getAllPosts();
  console.log(`Found ${markdownPostsAll.length} markdown posts, ${publishedPosts.length} published posts (${publishedPosts.filter(p => p.source === 'legacy').length} legacy)\n`);

  // Build HTML ONLY for markdown posts (never touch legacy HTML)
  for (const post of markdownPostsAll) {
    buildPostHtml(post);
  }

  console.log('\n📄 Regenerating index pages...');
  // Index, search, feed, sitemap use only published posts
  buildIndexHtml(publishedPosts);
  buildSearchIndex(publishedPosts);
  buildFeedXml(publishedPosts);
  buildSitemapXml(publishedPosts);

  console.log('\n✅ Blog build complete!');
}

main();