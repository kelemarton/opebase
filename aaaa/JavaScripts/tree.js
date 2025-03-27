    // Ellenőrizzük, hogy a File System Access API elérhető-e
    if (!window.showDirectoryPicker) {
        alert("A böngésződ nem támogatja a File System Access API-t.");
      }
  
      const selectBtn = document.getElementById('selectBtn');
      const treeContainer = document.getElementById('treeContainer');
  
      selectBtn.addEventListener('click', async () => {
        // A felhasználónak meg kell adnia a mappát
        const dirHandle = await window.showDirectoryPicker();
        console.log(dirHandle);
        treeContainer.innerHTML = '';
        const tree = await buildTree(dirHandle);
        treeContainer.appendChild(tree);
      });
  
      // Rekurzív függvény, amely felépíti a fájlfa struktúrát
      async function buildTree(dirHandle) {
        const ul = document.createElement('ul');
        // A directory handle bejárása (az API aszinkron iterátort biztosít)
        for await (const [name, handle] of dirHandle.entries()) {
          const li = document.createElement('li');
          if (handle.kind === 'directory') {
            li.innerHTML = `<span class="folder">📁 ${name}</span>`;
            li.addEventListener('click', async (e) => {
              e.stopPropagation();
              const childUl = li.querySelector('ul');
              if (childUl) {
                childUl.classList.toggle('hidden');
              } else {
                const newUl = await buildTree(handle);
                li.appendChild(newUl);
              }
            });
          } else if (handle.kind === 'file') {
            li.innerHTML = `<span class="file">📄 ${name}</span>`;
          }
          ul.appendChild(li);
        }
        return ul;
      }