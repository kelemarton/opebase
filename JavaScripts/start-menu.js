function openStartMenu() {
  const menuPoints = ["Settings"];
  const startMenuButton = document.getElementById("start-menu");
  const startMenuXCoord = startMenuButton ? startMenuButton.getBoundingClientRect().left : 0;

  const menuDivs = menuPoints.map((element, index) => {
      const div = document.createElement("div");
      div.id = element; // ID for JS targeting and potential specific styling
      div.classList.add("start-menu-item"); // Class for general styling

      // Dynamic positioning remains in JS
      div.style.top = `${startMenuButton ? startMenuButton.getBoundingClientRect().bottom + 15 + index * 60 : 0}px`;
      div.style.left = `${startMenuXCoord}px`;

      // onClick logic remains
      div.onclick = function () {
          // Check if the function exists globally before calling
          if (typeof window[element + "Click"] === 'function') {
              window[element + "Click"]();
          } else {
              console.warn(`Function ${element}Click not found.`);
          }
          // Assuming menuDivs here refers to the divs created in this instance of openStartMenu
          // If menuDivs should refer to ALL open start-menu-items, querySelectorAll would be needed here
          // For simplicity, keeping it to the current scope's items.
          // To close all items of this type, one might do:
          // document.querySelectorAll('.start-menu-item').forEach(item => item.remove());
          // But the original closeMenu handles this more broadly based on IDs.
          menuDivs.forEach(d => d.remove());
      };

      div.textContent = element;
      document.body.appendChild(div);
      return div;
  });
}

document.addEventListener("click", (e) => {
  // Close if click is outside the start menu button, and outside any item with class .start-menu-item or ID #Settings
  // The original logic was: !e.target.closest("#start-menu") && !e.target.closest("#Start") && !e.target.closest("#Settings")
  // We can make it more generic for items created by openStartMenu
  const isStartMenuItem = e.target.closest(".start-menu-item");
  const isStartMenuButton = e.target.closest("#start-menu");

  if (!isStartMenuButton && !isStartMenuItem) {
      closeMenu();
  }
});

function closeMenu() {
  // Closes elements with specific IDs as per original logic,
  // or all .start-menu-item if that's preferred.
  // Original: const menuDivs = document.querySelectorAll("#Start, #Settings");
  // If "Start" is also a .start-menu-item with ID "Start":
  const menuDivs = document.querySelectorAll(".start-menu-item"); // More generic if all items have this class
  menuDivs.forEach(div => div.remove());
}

(() => {
// CSS is now in start-menu.css, so no CSS injection here.

// SettingsClick function
window.SettingsClick = function() {
  if (document.getElementById('settingsWindow')) return;

  const settingsWindow = document.createElement('div');
  settingsWindow.id = 'settingsWindow';

  const settingsBox = document.createElement('div');
  settingsBox.id = 'settingsBox';

  const title = document.createElement('h2');
  title.textContent = '⚙️ Settings';
  // title.style.textAlign = 'center'; // Moved to CSS
  // title.style.color = '#fff'; // Moved to CSS
  settingsBox.appendChild(title);

  const form = document.createElement('form');
  form.id = 'settingsForm';

  const langRow = document.createElement('div');
  langRow.className = 'setting-row';
  langRow.innerHTML = `
    <span>🌐</span>
    <label for='languageSelect'>Nyelv:</label>
    <select id='languageSelect' disabled>
      <option>Magyar</option>
      <option>English</option>
    </select>
  `;
  form.appendChild(langRow);

  const themeRow = document.createElement('div');
  themeRow.className = 'setting-row';
  themeRow.innerHTML = `
    <span>🎨</span>
    <label for='themeSelect'>Theme:</label>
    <select id='themeSelect' disabled>
      <option>Dark</option>
      <option>Light</option>
    </select>
  `;
  form.appendChild(themeRow);

  const fullRow = document.createElement('div');
  fullRow.className = 'setting-row';
  fullRow.innerHTML = `
    <span>🖥️</span>
    <label for='fullscreenToggle'>Fullscreen:</label>
    <input type='checkbox' disabled id='fullscreenToggle'>
  `;
  form.appendChild(fullRow);

  const iconRow = document.createElement('div');
  iconRow.className = 'setting-row';
  const selectedIcon = document.createElement('img');
  selectedIcon.id = 'selectedIcon';
  selectedIcon.className = 'icon';
  selectedIcon.src = 'assets/icons/startmenu.png';

  const iconBtn = document.createElement('button');
  iconBtn.type = 'button';
  iconBtn.disabled = true;
  iconBtn.textContent = 'Ikon...';
  iconBtn.onclick = (e) => {
    e.stopPropagation();
    const iconSelector = document.getElementById('iconSelector'); // Get it when needed
    if (!iconSelector) return;
    const rect = iconBtn.getBoundingClientRect();
    iconSelector.style.top = rect.bottom + window.scrollY + 'px';
    iconSelector.style.left = rect.left + window.scrollX + 'px';
    iconSelector.style.display = iconSelector.style.display === 'flex' ? 'none' : 'flex';
  };

  iconRow.innerHTML = `<span>🔍</span><label>Ikon:</label>`;
  iconRow.appendChild(selectedIcon);
  iconRow.appendChild(iconBtn);
  form.appendChild(iconRow);

  const iconSelector = document.createElement('div');
  iconSelector.id = 'iconSelector';
  iconSelector.style.display = 'none'; // Initial state controlled by JS

  const closeX = document.createElement('span');
  closeX.className = 'close-icon';
  closeX.textContent = '✖️';
  closeX.onclick = () => iconSelector.style.display = 'none';
  iconSelector.appendChild(closeX);

  const iconList = ['icon1.png']; // Make sure path is correct
  iconList.forEach(filename => {
    const iconImg = document.createElement('img');
    iconImg.src = 'icons/' + filename; // Adjust path if needed, e.g., 'assets/icons/'
    iconImg.className = 'icon-option';
    iconImg.alt = filename; // Good practice for accessibility
    iconImg.onclick = (e) => {
      selectedIcon.src = iconImg.src;
      iconSelector.style.display = 'none';
    };
    iconSelector.appendChild(iconImg);
  });

  // Append iconSelector to settingsBox or body. Appending to settingsBox makes more sense contextually.
  settingsBox.appendChild(iconSelector);


  const btnRow = document.createElement('div');
  btnRow.id = 'btnRow'; // ID for potential specific styling, already has class for layout
  btnRow.className = 'setting-row'; // class for layout

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.textContent = '💾 Mentés';
  saveBtn.onclick = () => {
    const settings = {
      language: document.getElementById('languageSelect').value,
      theme: document.getElementById('themeSelect').value,
      fullscreen: document.getElementById('fullscreenToggle').checked,
      icon: selectedIcon.src
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Beállítások mentve!');
  };

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.textContent = '🔄 Reset';
  resetBtn.onclick = () => {
    const saved = JSON.parse(localStorage.getItem('appSettings') || '{}');
    if (saved.language) document.getElementById('languageSelect').value = saved.language;
    if (saved.theme) document.getElementById('themeSelect').value = saved.theme;
    if (saved.fullscreen !== undefined) document.getElementById('fullscreenToggle').checked = saved.fullscreen;
    if (saved.icon) selectedIcon.src = saved.icon;
    alert('Beállítások visszaállítva.');
  };

  btnRow.appendChild(saveBtn);
  btnRow.appendChild(resetBtn);
  form.appendChild(btnRow);

  settingsBox.appendChild(form);
  settingsWindow.appendChild(settingsBox);
  document.body.appendChild(settingsWindow);

  settingsWindow.addEventListener('click', e => {
    if (e.target === settingsWindow) {
      settingsWindow.remove();
    }
  });
};
})();