import { menuStructure } from './spawners.js';

export function createNavUI() {
  // ---- Persistent name, bottom-right ----
  const nameTag = document.createElement('div');
  nameTag.id = 'name-tag';
  nameTag.textContent = 'ARDIT STOJKAJ';
  document.body.appendChild(nameTag);

  // ---- Hamburger button ----
  const menuBtn = document.createElement('button');
  menuBtn.id = 'menu-toggle';
  menuBtn.innerHTML = '<span></span><span></span><span></span>';
  document.body.appendChild(menuBtn);

  // ---- Slide-in nav panel ----
  const navPanel = document.createElement('nav');
  navPanel.id = 'nav-panel';
  const navList = document.createElement('ul');
  navPanel.appendChild(navList);
  document.body.appendChild(navPanel);

  // ---- Build nav items dynamically from menuStructure ----
  const navItems = buildNavItems();

  navItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item.label;
    if (item.divider) {
      li.classList.add('nav-divider');
    } else {
      li.dataset.index = index;
    }
    navList.appendChild(li);
  });

  // ---- Styles ----
  const style = document.createElement('style');
  style.textContent = `
    #name-tag {
      position: fixed;
      bottom: 20px;
      right: 24px;
      font-family: sans-serif;
      font-size: 13px;
      letter-spacing: 1px;
      color: #fff;
      mix-blend-mode: difference;
      z-index: 50;
      pointer-events: none;
      transition: transform 0.4s ease;
    }
    #name-tag.nav-open {
      transform: translateX(150%);
    }

    #menu-toggle {
      position: fixed;
      bottom: 24px;
      width: 40px;
      height: 40px;
      background: black;
      border: none;
      cursor: pointer;
      z-index: 100;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 6px;
    }
    #menu-toggle span {
      display: block;
      width: 28px;
      height: 2px;
      background: #fff;
      mix-blend-mode: difference;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
    #menu-toggle.open span:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
    }
    #menu-toggle.open span:nth-child(2) {
      opacity: 0;
    }
    #menu-toggle.open span:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
    }

    #nav-panel {
      position: fixed;
      top: 0;
      right: 0;
      height: 100%;
      width: 280px;
      background: rgba(0, 0, 0, 0.9);
      transform: translateX(100%);
      transition: transform 0.4s ease;
      z-index: 90;
      display: flex;
      align-items: center;
    }
    #nav-panel.open {
      transform: translateX(0);
    }
    #nav-panel ul {
      list-style: none;
      margin: 0;
      padding: 0 40px;
      width: 100%;
    }
    #nav-panel li {
      font-family: sans-serif;
      font-size: 22px;
      letter-spacing: 1px;
      color: #fff;
      padding: 12px 0;
      cursor: pointer;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #nav-panel li:hover {
      opacity: 0.5;
      transform: translateX(-6px);
    }
    #nav-panel li.nav-divider {
      margin-top: 16px;
      font-size: 13px;
      opacity: 0.4;
      cursor: default;
      pointer-events: none;
    }
    #nav-panel li.nav-divider:hover {
      transform: none;
    }
  `;
  document.head.appendChild(style);

  // ---- Toggle open/close (name tag chained here) ----
  menuBtn.addEventListener('click', () => {
    const isOpen = menuBtn.classList.toggle('open');
    navPanel.classList.toggle('open', isOpen);
    nameTag.classList.toggle('nav-open', isOpen);
  });

  // ---- Handle clicks via stored action closures ----
  navList.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-index]');
    if (!li) return;

    const item = navItems[Number(li.dataset.index)];
    if (item && item.action) item.action();

    menuBtn.classList.remove('open');
    navPanel.classList.remove('open');
    nameTag.classList.remove('nav-open');
  });
}

// Walk menuStructure.main and flatten it into a nav list,
// so this stays in sync automatically if menuStructure changes.
function buildNavItems() {
  const items = [];

  items.push({ label: 'HOME', action: () => window.location.reload() });

  menuStructure.main.forEach(entry => {
    if (entry.isSubmenu) {
      const subKey = { 'ABOUT': 'about', 'CONTACT': 'contact' }[entry.text];
      const subItems = menuStructure[subKey] || [];

      if (subKey === 'about') {
        // ABOUT submenu is just a placeholder overlay trigger — link straight to it
        const aboutItem = subItems.find(i => i.isPlaceholder);
        items.push({
          label: entry.text,
          action: () => handleUrl(aboutItem && aboutItem.url)
        });
      } else {
        // CONTACT — expand into a divider + its children
        items.push({ label: entry.text, divider: true });
        subItems.forEach(sub => {
          items.push({ label: sub.text, action: () => handleUrl(sub.url) });
        });
      }
    } else {
      // Direct link, e.g. WORK
      items.push({ label: entry.text, action: () => handleUrl(entry.url) });
    }
  });

  return items;
}

function handleUrl(url) {
  if (!url) return;
  if (url.startsWith('#')) {
    window.portfolioApp.showOverlay(url.substring(1) + '-overlay');
  } else if (url.startsWith('mailto:')) {
    window.location.href = url;
  } else if (url.startsWith('http')) {
    window.open(url, '_blank');
  } else {
    window.location.href = url;
  }
}