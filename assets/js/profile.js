// assets/js/profile.js
// Profile page logic: session, info, password change/reset, history, downloads

(function() {
  // --- Session Guard ---
  var session = null;
  try { session = JSON.parse(localStorage.getItem('ndu_session')); } catch(e){}
  if (!session || !session.isLoggedIn) {
    window.location.href = 'index.html';
    return;
  }

  // --- DOM helpers ---
  function el(id) { return document.getElementById(id); }
  function showMsg(text, ok) {
    var m = el('pwMessage');
    if (!m) return;
    m.textContent = text;
    m.style.display = text ? 'block' : 'none';
    m.style.color = ok ? 'var(--olive)' : 'var(--gold)';
  }

  // --- Profile Info Render ---
  function renderProfile() {
    el('profile-username').textContent = session.username;
    el('profile-role').textContent = session.role;
    el('profile-email').textContent = session.email || 'demo@ndu.mn';
    el('profile-joined').textContent = session.joined || '2025-01-01';
  }

  // --- Edit Mode (demo) ---
  var editMode = false;
  el('profile-edit-btn').onclick = function() {
    editMode = !editMode;
    el('profile-edit-section').style.display = editMode ? '' : 'none';
    this.textContent = editMode ? 'Болих' : 'Засах';
  };

  // --- Password Tab Switch ---
  var tabBtns = document.querySelectorAll('.p-tab');
  var tabPanels = document.querySelectorAll('.p-tabpanel');
  tabBtns.forEach(function(btn) {
    btn.onclick = function() {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      var tab = btn.getAttribute('data-tab');
      var panel = document.getElementById('tab-' + tab);
      if (panel) panel.classList.add('active');
      showMsg('', true); // hide message
    };
  });

  // --- Password Change ---
  el('profile-pass-form').onsubmit = function(e) {
    e.preventDefault();
    var cur = el('profile-pass-current').value;
    var n1 = el('profile-pass-new').value;
    var n2 = el('profile-pass-repeat').value;
    var saved = localStorage.getItem('ndu_password') || '123';
    if (cur !== saved) return showMsg('Одоогийн нууц үг буруу', false);
    if (n1.length < 6) return showMsg('Шинэ нууц үг 6+ тэмдэгт байх ёстой', false);
    if (n1 !== n2) return showMsg('Давталт таарахгүй байна', false);
    localStorage.setItem('ndu_password', n1);
    showMsg('Амжилттай солигдлоо', true);
    this.reset();
  };

  // --- Password Reset Wizard ---
  var resetStep2 = el('resetStep2');
  if (resetStep2) resetStep2.style.display = 'none';
  el('profile-reset-send').onclick = function() {
    var email = el('profile-reset-email').value;
    if (!email || !/@/.test(email)) return showMsg('Зөв email оруулна уу', false);
    var code = Math.floor(100000 + Math.random()*900000).toString();
    localStorage.setItem('ndu_reset_code', code);
    if (resetStep2) resetStep2.style.display = 'block';
    showMsg('Код илгээгдлээ (demo: ' + code + ')', true);
  };
  el('profile-reset-verify').onclick = function() {
    var input = el('profile-reset-code').value;
    var code = localStorage.getItem('ndu_reset_code');
    if (input === code) {
      showMsg('Код баталгаажлаа', true);
    } else {
      showMsg('Код буруу', false);
    }
  };

  // --- Reading History & Downloads ---
  function getArr(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch(e){ return []; }
  }
  function renderList(list, wrapId, emptyMsg, isRead) {
    var wrap = el(wrapId);
    wrap.innerHTML = '';
    if (!list.length) {
      wrap.innerHTML = '<div class="profile-empty">' + emptyMsg + '</div>';
      return;
    }
    list.forEach(function(a) {
      var card = document.createElement('div');
      card.className = 'profile-list-card';
      card.innerHTML =
        '<div class="profile-list-title">' + a.title + '</div>' +
        (isRead ?
          '<div class="profile-list-meta">' + a.author + ' | ' + a.date + ' | ' + a.level + '</div>' +
          '<a class="profile-list-link" href="article.html?id=' + a.id + '">Дахин унших</a>'
        :
          '<div class="profile-list-meta">' + (a.downloadedAt || '') + '</div>' +
          '<a class="profile-list-link" href="' + (a.file || '#') + '" download>PDF татах</a>'
        );
      wrap.appendChild(card);
    });
  }

  renderProfile();
  renderList(getArr('ndu_recent_reads'), 'profile-recent-list', 'Одоогоор уншсан өгүүлэл алга', true);
  renderList(getArr('ndu_downloads'), 'profile-download-list', 'Одоогоор татсан өгүүлэл алга', false);

  // --- Tabs ---
  var tabBtns = document.querySelectorAll('.profile-tab');
  var tabSections = document.querySelectorAll('.profile-tab-section');
  tabBtns.forEach(function(btn, i) {
    btn.onclick = function() {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabSections.forEach(s => s.style.display = 'none');
      btn.classList.add('active');
      tabSections[i].style.display = '';
    };
  });
  // Default tab
  if (tabBtns[0]) tabBtns[0].click();

  // --- Researcher Section ---
  if (session.role === 'researcher') {
    var researcherCard = document.getElementById('researcherOnlyCard');
    if (researcherCard) researcherCard.style.display = '';
    // Researcher tab switch
    var rtabBtns = researcherCard.querySelectorAll('.p-tab[data-rtab]');
    var rtabPanels = [
      document.getElementById('rtab-submit'),
      document.getElementById('rtab-myworks')
    ];
    rtabBtns.forEach(function(btn, i) {
      btn.onclick = function() {
        rtabBtns.forEach(b => b.classList.remove('active'));
        rtabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        rtabPanels[i].classList.add('active');
      };
    });
    // Level field show/hide by type
    var rType = document.getElementById('rType');
    var rLevelField = document.getElementById('rLevelField');
    if (rType && rLevelField) {
      rType.onchange = function() {
        rLevelField.style.display = rType.value === 'article' ? '' : 'none';
      };
      rType.onchange();
    }
    // Upload form
    var uploadForm = document.getElementById('researcherUploadForm');
    var uploadMsg = document.getElementById('researcherUploadMsg');
    if (uploadForm) {
      uploadForm.onsubmit = function(e) {
        e.preventDefault();
        var type = el('rType').value;
        var title = el('rTitle').value;
        var author = el('rAuthor').value;
        var school = el('rSchool').value;
        var level = type === 'article' ? el('rLevel').value : '';
        var desc = el('rDesc').value;
        var fileInput = el('rFile');
        var fileName = fileInput && fileInput.files.length ? fileInput.files[0].name : '';
        if (!title || !author || !school || !desc || !fileName) {
          uploadMsg.textContent = 'Бүх талбарыг бөглөнө үү.';
          uploadMsg.style.display = 'block';
          uploadMsg.style.color = 'var(--gold)';
          return;
        }
        var uploads = getArr('ndu_researcher_uploads');
        uploads.unshift({
          type, title, author, school, level, desc, fileName,
          createdAt: new Date().toISOString().slice(0, 10)
        });
        if (uploads.length > 20) uploads = uploads.slice(0, 20);
        localStorage.setItem('ndu_researcher_uploads', JSON.stringify(uploads));
        uploadMsg.textContent = 'Амжилттай илгээгдлээ (demo)';
        uploadMsg.style.display = 'block';
        uploadMsg.style.color = 'var(--olive)';
        uploadForm.reset();
        renderMyWorks();
      };
    }
    // Render my works
    function renderMyWorks() {
      var list = getArr('ndu_researcher_uploads');
      var wrap = document.getElementById('researcherWorksList');
      if (!wrap) return;
      wrap.innerHTML = '';
      if (!list.length) {
        wrap.innerHTML = '<div class="profile-empty">Одоогоор оруулсан файл алга.</div>';
        return;
      }
      list.forEach(function(a) {
        var card = document.createElement('div');
        card.className = 'profile-list-card';
        card.innerHTML =
          '<div class="profile-list-title">' + a.title + '</div>' +
          '<div class="profile-list-meta">' + (a.type === 'article' ? 'Өгүүлэл' : 'Ном') + ' | ' + a.author + ' | ' + a.school + (a.level ? ' | ' + a.level : '') + ' | ' + a.createdAt + '</div>' +
          '<div class="profile-list-meta">' + a.desc + '</div>' +
          '<div class="profile-list-meta">PDF: ' + a.fileName + '</div>';
        wrap.appendChild(card);
      });
    }
    renderMyWorks();
  }
  // Hide researcher card for non-researcher
  else {
    var researcherCard = document.getElementById('researcherOnlyCard');
    if (researcherCard) researcherCard.style.display = 'none';
  }

})();

// --- For article.html: addRecentRead/addDownload ---
window.addRecentRead = function(article) {
  var arr = [];
  try { arr = JSON.parse(localStorage.getItem('ndu_recent_reads')) || []; } catch(e){}
  arr = arr.filter(a => a.id !== article.id);
  arr.unshift(article);
  if (arr.length > 10) arr = arr.slice(0, 10);
  localStorage.setItem('ndu_recent_reads', JSON.stringify(arr));
};
window.addDownload = function(article) {
  var arr = [];
  try { arr = JSON.parse(localStorage.getItem('ndu_downloads')) || []; } catch(e){}
  arr = arr.filter(a => a.id !== article.id);
  arr.unshift(article);
  if (arr.length > 10) arr = arr.slice(0, 10);
  localStorage.setItem('ndu_downloads', JSON.stringify(arr));
};
