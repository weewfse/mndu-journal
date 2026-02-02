// index.js
// Render latest articles and make article cards link to article.html?id=...
// Does NOT change design, class names, or layout

const latestArticles = [
  {
    id: '1',
    title: 'Үндэсний аюулгүй байдлын судалгаа',
    author: 'Б. Бат-Эрдэнэ',
    date: '2025-11-12',
    desc: 'Энэхүү өгүүлэлд үндэсний аюулгүй байдлын онолын үндэс, судалгааны арга зүйг авч үзэв.'
  },
  {
    id: '2',
    title: 'Цэргийн технологийн хөгжил',
    author: 'Д. Сүхбаатар',
    date: '2024-06-21',
    desc: 'Цэргийн технологийн шинэчлэл ба түүний нийгэмд үзүүлэх нөлөөний талаар.'
  }
  // ... add more mock articles as needed
];

document.addEventListener('DOMContentLoaded', function() {
  const list = document.getElementById('latestArticles');
  if (!list) return;
  list.innerHTML = latestArticles.map(a => `
    <a class="article-card" href="article.html?id=${a.id}" style="text-decoration:none;color:inherit;">
      <div class="article-title">${a.title}</div>
      <div class="article-meta">${a.author} | ${a.date}</div>
      <div class="article-desc">${a.desc}</div>
    </a>
  `).join('');
});
