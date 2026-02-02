// article.js
// Loads article details based on ?id= query parameter
// Does NOT change any design, color, or class names
// Uses mock data for demonstration


function getArticlesFromStorage() {
  try {
    const arr = JSON.parse(localStorage.getItem('ndu_articles')) || [];
    return Array.isArray(arr) ? arr : [];
  } catch(e) { return []; }
}

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}


function renderArticle(article) {
  document.getElementById('articleTitle').textContent = article.title;
  document.getElementById('articleAuthor').textContent = 'Зохиогч: ' + article.author;
  document.getElementById('articleDate').textContent = 'Огноо: ' + (article.date || '');
  document.getElementById('articleLevel').textContent = article.level || '';
  document.getElementById('articleAbstract').textContent = article.desc || article.abstract || '';
  // Render keywords as badges (if present)
  const kwWrap = document.getElementById('articleKeywords');
  kwWrap.innerHTML = '';
  if (article.keywords && Array.isArray(article.keywords)) {
    article.keywords.forEach(kw => {
      const span = document.createElement('span');
      span.textContent = kw;
      span.style.background = 'var(--gold,#C9A227)';
      span.style.color = '#fff';
      span.style.padding = '0.18em 0.7em';
      span.style.borderRadius = '7px';
      span.style.marginRight = '0.5em';
      span.style.fontSize = '0.97em';
      span.style.display = 'inline-block';
      kwWrap.appendChild(span);
    });
  }
  // PDF
  var pdfPath = article.pdfPath || article.pdf || '';
  var iframe = document.getElementById('articlePdf');
  var pdfViewer = document.getElementById('pdfViewer');
  if (pdfPath) {
    // Check if file exists (demo: try to load, fallback onerror)
    iframe.src = pdfPath;
    iframe.onerror = function() {
      pdfViewer.innerHTML = '<div style="padding:2em;text-align:center;color:var(--olive);font-size:1.1em;">PDF файл серверт байршуулаагүй байна (demo)</div>';
    };
  } else {
    pdfViewer.innerHTML = '<div style="padding:2em;text-align:center;color:var(--olive);font-size:1.1em;">PDF файл серверт байршуулаагүй байна (demo)</div>';
  }
  document.getElementById('viewPdfBtn').href = '#pdfViewer';
  document.getElementById('downloadPdfBtn').href = pdfPath || '#';
}


window.addEventListener('DOMContentLoaded', () => {
  const id = getQueryParam('id');
  const articles = getArticlesFromStorage();
  const article = articles.find(a => a.id === id) || articles[0];
  if (!article) {
    document.getElementById('articleTitle').textContent = 'Өгүүлэл олдсонгүй';
    document.getElementById('pdfViewer').innerHTML = '<div style="padding:2em;text-align:center;color:var(--olive);font-size:1.1em;">Өгүүлэл олдсонгүй</div>';
    return;
  }
  renderArticle(article);
  // Add recent read on view
  const meta = {
    id: article.id,
    title: article.title,
    author: article.author,
    date: article.date,
    level: article.level,
    readAt: new Date().toISOString().slice(0, 10)
  };
  document.getElementById('viewPdfBtn').addEventListener('click', function() {
    if (window.addRecentRead) window.addRecentRead(meta);
  });
  document.getElementById('downloadPdfBtn').addEventListener('click', function() {
    if (window.addDownload) window.addDownload({
      id: article.id,
      title: article.title,
      file: article.pdfPath || article.pdf || '',
      downloadedAt: new Date().toISOString().slice(0, 10)
    });
  });
});
