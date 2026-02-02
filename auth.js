// auth.js (PHP session based) — fixed for both <ul.nav-links> and <div.navbar-links>

async function apiMe() {
  const res = await fetch("api/me.php", {
    method: "GET",
    credentials: "same-origin"
  });
  return res.json();
}

async function apiLogin(username, password) {
  const fd = new FormData();
  fd.append("username", username);
  fd.append("password", password);

  const res = await fetch("api/auth_login.php", {
    method: "POST",
    body: fd,
    credentials: "same-origin"
  });

  return res.json();
}

// POST-ыг эхэлж оролдоод, болохгүй бол GET-ээр fallback
async function apiLogout() {
  try {
    const res = await fetch("api/auth_logout.php", {
      method: "POST",
      credentials: "same-origin"
    });
    return res.json();
  } catch (e) {
    const res = await fetch("api/auth_logout.php", {
      method: "GET",
      credentials: "same-origin"
    });
    return res.json();
  }
}

function isUlNav(nav) {
  return nav && nav.tagName === "UL";
}

function removeIfExists(selector) {
  document.querySelectorAll(selector).forEach(el => el.remove());
}

function hideLoginItem(loginItem, show) {
  if (!loginItem) return;
  // loginItem нь <li> эсвэл <a> байж болно
  loginItem.style.display = show ? "" : "none";
}

// Create nav item (li>a) for UL, or (a) for DIV
function createNavLink(nav, { id, text, href, onClick, className }) {
  if (isUlNav(nav)) {
    const li = document.createElement("li");
    if (id) li.id = id;

    const a = document.createElement("a");
    a.href = href || "#";
    a.textContent = text;
    if (className) a.className = className;
    if (onClick) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        onClick(e);
      });
    }
    li.appendChild(a);
    return li;
  } else {
    const a = document.createElement("a");
    if (id) a.id = id;
    a.href = href || "#";
    a.textContent = text;
    if (className) a.className = className;
    if (onClick) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        onClick(e);
      });
    }
    return a;
  }
}

function appendNavItem(nav, item) {
  nav.appendChild(item);
}

function findNav(navSelectors) {
  for (const sel of navSelectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

// Global logout
window.logout = async function () {
  try { await apiLogout(); } catch (e) {}
  // reload хийх нь бүх хуудсанд зөв state шинэчилнэ
  window.location.reload();
};

// Login handler (modal-аас дуудагдана)
window.handleLogin = async function (username, password) {
  const data = await apiLogin(username, password);
  if (data && data.ok) {
    // modal хаах
    const modal = document.getElementById("loginModal");
    if (modal) modal.classList.remove("active");

    await updateNavbar();
    // account руу шилжүүлэх (та хүсвэл comment болгоод redirectгүй болгож болно)
    window.location.href = "account.html";
    return true;
  }
  alert("Нэвтрэх нэр эсвэл нууц үг буруу");
  return false;
};

async function updateNavbar() {
  const nav = findNav([".nav-links", ".navbar-links"]);
  if (!nav) return;

  // 🔥 Хуучин нэмэгдсэн зүйлсийг цэвэрлэ
  // UL дээр id-тай li байж магадгүй, DIV дээр a байж магадгүй
  removeIfExists("#navAccount");
  removeIfExists("#nav-logout");
  removeIfExists("#logoutLink"); // заримдаа тусдаа id-тай байдаг

  // Login item олъё (хоёр төрлийн navbar-ийг дэмжинэ)
  const loginItem =
    document.querySelector("#nav-login") || // <li id="nav-login"> (index/archive)
    document.querySelector("#loginNav");    // <a id="loginNav"> (article.html)

  let me;
  try {
    me = await apiMe();
  } catch (e) {
    // API уналаа: login харагдуулж үлдээнэ
    hideLoginItem(loginItem, true);
    return;
  }

  if (me && me.ok) {
    // Logged in → login нуух
    hideLoginItem(loginItem, false);

    const roleText = (me.user?.role === "researcher") ? "Судлаач" : "Хэрэглэгч";

    // Account link
    const acc = createNavLink(nav, {
      id: "navAccount",
      text: roleText,
      href: "account.html"
    });
    appendNavItem(nav, acc);

    // Logout link
    const logout = createNavLink(nav, {
      id: "nav-logout",
      text: "Гарах",
      href: "#",
      onClick: () => window.logout()
    });
    appendNavItem(nav, logout);

  } else {
    // Logged out → login харагдана
    hideLoginItem(loginItem, true);
  }
}

// Login modal-ийн form submit-ийг шууд барина (index.html дээр нэмэлт код шаардахгүй)
function bindLoginModal() {
  const form = document.querySelector("#loginModal .login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = document.getElementById("login-username")?.value?.trim() || "";
    const p = document.getElementById("login-password")?.value?.trim() || "";
    await window.handleLogin(u, p);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  bindLoginModal();
  await updateNavbar();
});
