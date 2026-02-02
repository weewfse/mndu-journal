// account.js
// Renders role-based content for account.html
// Uses localStorage for user role

document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const content = document.getElementById('accountContent');
  if (!user) {
    content.innerHTML = '<div>Та нэвтэрч ороогүй байна.</div>';
    return;
  }
  if (user.role === 'user') {
    content.innerHTML = `
      <div style="margin-bottom:1.5em;">
        <strong>Миний татсан өгүүллүүд</strong>
        <ul><li>Mock өгүүлэл 1</li><li>Mock өгүүлэл 2</li></ul>
      </div>
      <div>
        <strong>Уншсан түүх</strong>
        <ul><li>Mock өгүүлэл 3</li></ul>
      </div>
    `;
  } else if (user.role === 'researcher') {
    content.innerHTML = `
      <div style="margin-bottom:1.5em;">
        <strong>Миний оруулсан өгүүллүүд</strong>
        <ul><li>Mock өгүүлэл 1</li></ul>
      </div>
      <button id="submitArticleBtn" style="background:var(--olive,#3A4A2A);color:#fff;padding:0.5em 1.2em;border-radius:8px;font-weight:500;">Өгүүлэл оруулах</button>
    `;
    document.getElementById('submitArticleBtn').onclick = function() {
      window.location.href = 'submit-article.html';
    };
  }
  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = function() {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    };
  }
});
