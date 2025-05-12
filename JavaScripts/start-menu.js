function openStartMenu() {
    const menuPoints = ["Settings"];
    const startMenuButton = document.getElementById("start-menu");
    const startMenuXCoord = startMenuButton ? startMenuButton.getBoundingClientRect().left : 0;

    const menuDivs = menuPoints.map((element, index) => {
        const div = document.createElement("div");
        div.id = element;
        div.style.position = "absolute";
        div.style.height = "50px";
        div.style.width = "140px";
        div.style.borderRadius = "12px";
        div.style.backgroundColor = "#f9f9f9";
        div.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        div.style.cursor = "pointer";
        div.style.transition = "background-color 0.2s ease, transform 0.2s ease";
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.justifyContent = "center";
        div.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        div.style.fontSize = "16px";
        div.style.fontWeight = "500";
        div.style.color = "#333";
        div.style.userSelect = "none";
        div.style.top = `${startMenuButton ? startMenuButton.getBoundingClientRect().bottom + 15 + index * 60 : 0}px`;
        div.style.left = `${startMenuXCoord}px`;

        div.onmouseenter = () => {
            div.style.backgroundColor = "#e0e0e0";
            div.style.transform = "translateY(-2px)";
        };
        div.onmouseleave = () => {
            div.style.backgroundColor = "#f9f9f9";
            div.style.transform = "translateY(0)";
        };

        div.onclick = function () {
            window[element + "Click"]?.();
            menuDivs.forEach(div => div.remove());
        };

        div.textContent = element;

        document.body.appendChild(div);

        return div;
    });
}


document.addEventListener("click", (e) => {
    if(!e.target.closest("#start-menu") && !e.target.closest("#Start") && !e.target.closest("#Settings")) {
        closeMenu();
    }
});

function closeMenu() {
    const menuDivs = document.querySelectorAll("#Start, #Settings");
    menuDivs.forEach(div => div.remove());
}



(() => {
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    .setting-row {
      display: flex;
      align-items: center;
      margin: 14px 0;
      gap: 14px;
      font-size: 1.15em;
      color: #333;
    }

    .setting-row img.icon {
      width: 26px;
      height: 26px;
    }

    #iconSelector {
      display: none;
      position: absolute;
      background-color: #fafafa;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 12px;
      flex-wrap: wrap;
      gap: 12px;
      min-width: 200px;
      max-width: 300px;
      max-height: 250px;
      overflow-y: auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      z-index: 1001;
    }

    #iconSelector .close-icon {
      position: absolute;
      top: 6px;
      right: 6px;
      cursor: pointer;
      font-size: 1.2em;
      color: #666;
    }

    #iconSelector img.icon-option {
      width: 40px;
      height: 40px;
      cursor: pointer;
      border-radius: 6px;
      transition: transform 0.1s ease;
    }

    #iconSelector img.icon-option:hover {
      transform: scale(1.1);
    }

    #settingsWindow {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    #settingsBox {
      position: relative;
      width: 480px;
      max-height: 85vh;
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
      overflow-y: auto;
      padding: 24px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    #settingsBox h2 {
      margin-top: 0;
      font-size: 1.6em;
      color: #222;
    }

    button {
      padding: 8px 16px;
      font-size: 1em;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      background-color: #eee;
      transition: background-color 0.2s ease;
    }

    button:hover {
      background-color: #ddd;
    }

    #btnRow {
      justify-content: flex-end;
      margin-top: 24px;
    }
  `;
  document.head.appendChild(style);

  // SettingsClick function
  window.SettingsClick = function() {
    console.log('Settings clicked.');


    if (document.getElementById('settingsWindow')) return;

    // Overlay
    const settingsWindow = document.createElement('div');
    settingsWindow.id = 'settingsWindow';

    // Box
    const settingsBox = document.createElement('div');
    settingsBox.id = 'settingsBox';

    // Title
    const title = document.createElement('h2');
    title.textContent = '⚙️ Beállítások';
    title.style.textAlign = 'center';
    settingsBox.appendChild(title);

    // Form
    const form = document.createElement('form');
    form.id = 'settingsForm';

    // Language (disabled)
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

    // Theme (disabled)
    const themeRow = document.createElement('div');
    themeRow.className = 'setting-row';
    themeRow.innerHTML = `
      <span>🎨</span>
      <label for='themeSelect'>Téma:</label>
      <select id='themeSelect' disabled>
        <option>Világos</option>
        <option>Sötét</option>
      </select>
    `;
    form.appendChild(themeRow);


    // Fullscreen Mode toggle
    const fullRow = document.createElement('div');
    fullRow.className = 'setting-row';
    fullRow.innerHTML = `
      <span>🖥️</span>
      <label for='fullscreenToggle'>Teljes képernyő:</label>
      <input type='checkbox' id='fullscreenToggle'>
    `;
    form.appendChild(fullRow);

    // Icon selector row
    const iconRow = document.createElement('div');
    iconRow.className = 'setting-row';
    const selectedIcon = document.createElement('img');
    selectedIcon.id = 'selectedIcon';
    selectedIcon.className = 'icon';
    selectedIcon.src = 'icons/default.png';

    const iconBtn = document.createElement('button');
    iconBtn.type = 'button';
    iconBtn.textContent = 'Ikon...';
    iconBtn.onclick = (e) => {
      e.stopPropagation();
      const rect = iconBtn.getBoundingClientRect();
      iconSelector.style.top = rect.bottom + window.scrollY + 'px';
      iconSelector.style.left = rect.left + window.scrollX + 'px';
      iconSelector.style.display = iconSelector.style.display === 'flex' ? 'none' : 'flex';
    };

    iconRow.innerHTML = `<span>🔍</span><label>Ikon:</label>`;
    iconRow.appendChild(selectedIcon);
    iconRow.appendChild(iconBtn);
    form.appendChild(iconRow);

    // Icon selector overlay
    const iconSelector = document.createElement('div');
    iconSelector.id = 'iconSelector';
    iconSelector.style.display = 'none';

    // Close icon
    const closeX = document.createElement('span');
    closeX.className = 'close-icon';
    closeX.textContent = '✖️';
    closeX.onclick = () => iconSelector.style.display = 'none';
    iconSelector.appendChild(closeX);

    const iconList = ['icon1.png'];
    iconList.forEach(filename => {
      const iconImg = document.createElement('img');
      iconImg.src = 'icons/' + filename;
      iconImg.className = 'icon-option';
      iconImg.onclick = (e) => {
        selectedIcon.src = iconImg.src;
        iconSelector.style.display = 'none';
      };
      iconSelector.appendChild(iconImg);
    });

    settingsBox.appendChild(iconSelector);

    // Save and Reset buttons
    const btnRow = document.createElement('div');
    btnRow.id = 'btnRow';
    btnRow.className = 'setting-row';

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

    // Close on background click
    settingsWindow.addEventListener('click', e => {
      if (e.target === settingsWindow) {
        settingsWindow.remove();
      }
    });
  };
})();