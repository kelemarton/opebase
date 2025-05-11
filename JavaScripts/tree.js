// A fájlkiterjesztésekhez tartozó ikonok térképe
const fileIconsMap = {
  "default": "📄",
  "txt": "📝",
  "js": "📜",
  "html": "🌐",
  "css": "🎨",
  "json": "⚙️",
  "png": "🖼️",
  "jpg": "🖼️",
  "jpeg": "🖼️",
  "gif": "🖼️",
  "pdf": "📚",
  "zip": "📦",
  "rar": "📦",
  "exe": "⚙️",
  "doc": "📄",
  "docx": "📄",
  "xls": "📊",
  "xlsx": "📊",
  "ppt": "🖥️",
  "pptx": "🖥️",
  "mp3": "🎵",
  "wav": "🎵",
  "mp4": "🎬",
  "avi": "🎬"
};

/**
* Visszaadja a megfelelő ikont egy fájlnévhez a kiterjesztése alapján.
* @param {string} fileName - A fájl neve.
* @param {object} iconMap - A kiterjesztések ikonokhoz való térképe.
* @returns {string} Az ikon karakter (emoji).
*/
function getFileIcon(fileName, iconMap) {
  const lastDotIndex = fileName.lastIndexOf('.');

  // Ha nincs pont, vagy a pont az első karakter (rejtett fájl kiterjesztés nélkül)
  if (lastDotIndex === -1 || lastDotIndex === 0) {
      return iconMap.default;
  }

  const extension = fileName.substring(lastDotIndex + 1).toLowerCase();

  // Visszaadja a kiterjesztéshez tartozó ikont, vagy az alapértelmezettet, ha nem található.
  return iconMap[extension] || iconMap.default;
}

/**
* Rekurzív aszinkron függvény, amely felépíti egy adott mappából kiindulva a fájlfa struktúra HTML elemeit.
* @param {FileSystemDirectoryHandle} directoryHandle - A feldolgozandó mappa handle-je.
* @param {object} iconMap - A kiterjesztések ikonokhoz való térképe.
* @returns {Promise<HTMLUListElement>} Egy Promise, amely az elkészült UL elemet adja vissza.
*/
async function buildTree(directoryHandle, iconMap) {
  const ulElement = document.createElement('ul');

  try {
      // Bejárjuk a mappa elemeit aszinkron iterátorral
      for await (const [name, handle] of directoryHandle.entries()) {
          const liElement = document.createElement('li');

          if (handle.kind === 'directory') {
              // Ha a bejegyzés mappa
              const folderSpan = document.createElement('span');
              folderSpan.classList.add('folder');
              folderSpan.innerHTML = `📁 ${name}`; // Mappa ikon és név

              liElement.appendChild(folderSpan);

              // Kattintás eseményfigyelő CSAK a mappa SPAN-ra
              folderSpan.addEventListener('click', async (e) => {
                  e.stopPropagation(); // Megállítja a buborékolást

                  const parentLi = e.target.closest('li'); // Megkeresi a szülő LI-t
                  const childUl = parentLi.querySelector('ul'); // Keresi a már létező UL-t

                  if (childUl) {
                      // Ha már van UL, csak váltja a láthatóságát
                      childUl.classList.toggle('hidden');
                  } else {
                      // Ha nincs UL, felépíti az almappát
                      try {
                          const newUl = await buildTree(handle, iconMap); // Rekurzív hívás
                          parentLi.appendChild(newUl);
                      } catch (subError) {
                          console.error(`Hiba az almappa tartalmának betöltése közben (${name}):`, subError);
                          const errorLi = document.createElement('li');
                          errorLi.textContent = `🚫 Hiba a mappa tartalmának olvasása közben.`;
                          parentLi.appendChild(errorLi);
                      }
                  }
              });

          } else if (handle.kind === 'file') {
              // Ha a bejegyzés fájl
              const fileSpan = document.createElement('span');
              fileSpan.classList.add('file');

              // Meghatározzuk a megfelelő ikont
              const fileIcon = getFileIcon(name, iconMap);

              fileSpan.innerHTML = `${fileIcon} ${name}`; // Ikon és fájlnév

              liElement.appendChild(fileSpan);
              // Fájlokhoz nem adunk kattintás eseményfigyelőt
          }

          ulElement.appendChild(liElement);
      }
  } catch (loopError) {
      console.error(`Hiba a mappa bejegyzéseinek olvasása közben (${directoryHandle.name}):`, loopError);
      const errorLi = document.createElement('li');
      errorLi.textContent = `🚫 Hiba a mappa tartalmának olvasása közben.`;
      ulElement.appendChild(errorLi);
  }

  return ulElement;
}

// Fő logika a lap betöltődése után

// Ellenőrzés az API támogatására
if (!window.showDirectoryPicker) {
  alert("A böngésződ nem támogatja a File System Access API-t. Kérlek használj egy modern böngészőt (pl. Chrome, Edge).");
  // Ha nem támogatott, nem regisztráljuk az eseményfigyelőt sem
} else {
  // Megszerezzük a gomb és a konténer elemeket
  const selectBtn = document.getElementById('selectBtn');
  const treeContainer = document.getElementById('treeContainer');

  if (!selectBtn || !treeContainer) {
       console.error("Hiba: Hiányzik a 'selectBtn' vagy a 'treeContainer' elem a HTML-ben.");
       // Ha hiányzik valamelyik, itt megállunk
  } else {
      // Eseményfigyelő a gombra
      selectBtn.addEventListener('click', async () => {
          treeContainer.innerHTML = '<p>Mappa kiválasztása...</p>'; // Visszajelzés a felhasználónak

          let rootDirectoryHandle = null;
          try {
              // Megnyitjuk a böngésző mappa kiválasztó ablakát.
              // Ez most garantáltan felhasználói interakcióra történik.
              rootDirectoryHandle = await window.showDirectoryPicker();
          } catch (error) {
              console.error("Mappa kiválasztása megszakítva vagy hiba történt:", error);
              // Ha a felhasználó megszakítja vagy hiba van
              treeContainer.innerHTML = '<p>Mappa kiválasztása megszakítva vagy hiba történt.</p>';
              return; // Megáll, ha nincs kiválasztott mappa
          }

          // Ha a felhasználó sikeresen kiválasztott egy mappát
          if (rootDirectoryHandle) {
              treeContainer.innerHTML = ''; // Kiürítjük a konténert
              try {
                  // Felépítjük és megjelenítjük a fát
                  const directoryTreeElement = await buildTree(rootDirectoryHandle, fileIconsMap); // Átadjuk az ikon térképet
                  treeContainer.appendChild(directoryTreeElement);
              } catch (error) {
                   console.error("Hiba történt a mappastruktúra betöltése közben:", error);
                   treeContainer.innerHTML = '<p>Hiba történt a mappastruktúra betöltése közben.</p>';
              }
          }
      });
  }
}