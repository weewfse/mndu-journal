// archive.js
// Live search/filter for archive.html (no backend)
// Filters article cards by title, author, or date (text content)
// Does NOT change HTML structure or class names

document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.querySelector('.search-bar input, #searchInput');
  if (!searchInput) return;
  searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    // Find all article cards (assume .article-card or similar class)
    const cards = document.querySelectorAll('.article-card, .school-card, .military-card');
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(query)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });
});
