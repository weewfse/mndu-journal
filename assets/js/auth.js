// assets/js/auth.js
// Login flow, session, navbar profile link, logout
// NO CSS/class/layout/HTML changes


(function() {
  // --- 1. LOGIN SUBMIT + TOGGLE ---
  var selectedUserType = "user";
  var userBtn = document.getElementById('userTypeBtn');
  var researcherBtn = document.getElementById('researcherTypeBtn');
  if (userBtn && researcherBtn) {
    userBtn.onclick = function() {
      selectedUserType = "user";
      userBtn.classList.add('active');
      researcherBtn.classList.remove('active');
    };
    researcherBtn.onclick = function() {
      selectedUserType = "researcher";
      researcherBtn.classList.add('active');
      userBtn.classList.remove('active');
    };
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem('ndu_session')); } catch(e){ return null; }
  }

  function updateNavbar() {
    var session = getSession();
    var navLinks = document.querySelector('ul.nav-links');
    var navLogin = document.getElementById('nav-login');
    if (!navLinks) return;

    // 1. Remove any lingering "Өөрийн profile" nav item (fail-safe)
    Array.from(navLinks.querySelectorAll('a')).forEach(function(a) {
      if (a.textContent.trim() === 'Өөрийн profile' && a.closest('li')) {
        a.closest('li').remove();
      }
    });
    // 2. Remove any nav-role-pill, nav-avatar, badge, or pill class from role link if present
    var oldRoleLi = document.getElementById('nav-role');
    if (oldRoleLi) oldRoleLi.remove();

    // 3. Remove any nav-avatar, badge, or pill DOM if present (fail-safe)
    Array.from(navLinks.querySelectorAll('.nav-role-pill, .nav-avatar, .p-badge-role')).forEach(function(el) { el.remove(); });

    // 4. Find logout li
    let navLogout = document.getElementById('nav-logout') || Array.from(navLinks.querySelectorAll('li')).find(li => li.textContent && li.textContent.includes('Гарах'));
    if (session && session.isLoggedIn) {
      if (navLogin) navLogin.style.display = 'none';
      // 5. Create role nav link (plain, no pill)
      var roleLi = document.createElement('li');
      roleLi.id = 'nav-role';
      var roleA = document.createElement('a');
      roleA.id = 'roleLink';
      roleA.href = 'account.html';
      roleA.textContent = session.role === 'researcher' ? 'Судлаач' : 'Хэрэглэгч';
      roleLi.appendChild(roleA);
      // Insert after "Архив"
      var archiveLi = Array.from(navLinks.querySelectorAll('li')).find(li => {
        var a = li.querySelector('a');
        return a && (a.getAttribute('href') === 'archive.html' || a.textContent.trim() === 'Архив');
      });
      if (archiveLi && archiveLi.nextSibling) {
        navLinks.insertBefore(roleLi, archiveLi.nextSibling);
      } else {
        navLinks.appendChild(roleLi);
      }
      // 6. Add logout if not present, and place after role
      if (!navLogout) {
        let logoutLi = document.createElement('li');
        logoutLi.id = 'nav-logout';
        let logoutA = document.createElement('a');
        logoutA.id = 'logoutLink';
        logoutA.textContent = 'Гарах';
        logoutA.href = '#logout';
        logoutA.onclick = function(e) {
          e.preventDefault();
          localStorage.removeItem('ndu_session');
          updateNavbar();
          window.location.href = 'index.html';
        };
        logoutLi.appendChild(logoutA);
        if (roleLi.nextSibling) {
          navLinks.insertBefore(logoutLi, roleLi.nextSibling);
        } else {
          navLinks.appendChild(logoutLi);
        }
      } else {
        // Move logout after role if not already
        if (navLogout !== roleLi.nextSibling) {
          navLinks.insertBefore(navLogout, roleLi.nextSibling);
        }
      }
    } else {
      if (navLogin) navLogin.style.display = '';
      // Remove/hide role li
      var oldRoleLi2 = document.getElementById('nav-role');
      if (oldRoleLi2) oldRoleLi2.remove();
      // Remove logout
      if (navLogout) navLogout.remove();
    }
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    var username = document.getElementById('login-username');
    var password = document.getElementById('login-password');
    if (!username || !password) return;
    if (username.value === '123' && password.value === '123') {
      // Save session with role
      localStorage.setItem('ndu_session', JSON.stringify({ username: '123', role: selectedUserType, isLoggedIn: true }));
      // Hide modal
      var modal = document.getElementById('loginModal');
      if (modal) modal.classList.remove('active');
      // Show notification (simple, no new CSS)
      showLoginToast('Амжилттай нэвтэрлээ');
      // Update navbar
      updateNavbar();
    } else {
      alert('Нэвтрэх нэр эсвэл нууц үг буруу');
    }
  }

  // --- 2. TOAST NOTIFICATION ---
  function showLoginToast(msg) {
    // Try to show under navbar or hero, fallback to console
    var nav = document.querySelector('.navbar');
    var toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.position = 'relative';
    toast.style.background = '#3A4A2A';
    toast.style.color = '#fff';
    toast.style.padding = '0.4em 1.2em';
    toast.style.borderRadius = '8px';
    toast.style.fontSize = '1em';
    toast.style.margin = '0.5em auto';
    toast.style.textAlign = 'center';
    toast.style.zIndex = 1000;
    toast.style.maxWidth = '320px';
    toast.style.boxShadow = '0 2px 8px rgba(11,31,59,0.07)';
    if (nav && nav.parentNode) {
      nav.parentNode.insertBefore(toast, nav.nextSibling);
      setTimeout(function() { toast.remove(); }, 1800);
    } else {
      console.log(msg);
    }
  }



  function initLoginHandlers() {
    var loginForm = document.querySelector('.login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLoginSubmit);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    initLoginHandlers();
    updateNavbar();
  });

  // --- 5. EXPORT FOR ACCOUNT PAGE ---
  window.nduAuth = {
    getSession,
    updateNavbar,
    logout: function() {
      localStorage.removeItem('ndu_session');
      updateNavbar();
      window.location.href = 'index.html';
    }
  };
})();
