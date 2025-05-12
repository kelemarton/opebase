// --- START OF FILE tree.js ---

// Import the window creation function from manage.js
// Adjust the path './manage.js' if your file structure is different
import { createWindow } from './windows/manage.js';

// A fájlkiterjesztésekhez tartozó ikonok térképe (Expanded for Media)
const fileIconsMap = {
    "default": "📄", "txt": "📝", "js": "📜", "html": "🌐", "css": "🎨",
    "json": "⚙️", "png": "🖼️", "jpg": "🖼️", "jpeg": "🖼️", "gif": "🖼️",
    "pdf": "📚", "zip": "📦", "rar": "📦", "exe": "⚙️", "doc": "📄",
    "docx": "📄", "xls": "📊", "xlsx": "📊", "ppt": "🖥️", "pptx": "🖥️",
    "mp3": "🎵", "wav": "🎵", "ogg": "🎵", "flac": "🎵", "aac": "🎵", "m4a": "🎵", // Audio Icons
    "mp4": "🎬", "avi": "🎬", "mov": "🎬", "wmv": "🎬", "mkv": "🎬", "webm": "🎬", // Video Icons
    "py": "🐍", "md": "✍️", "log": "📜", "xml": "⚙️", "yaml": "⚙️", "yml": "⚙️",
    "sh": "💲", "bmp": "🖼️", "webp": "🖼️", "svg": "✨", "ico": "🖼️",
    "java": "☕", "c": "🇨", "cpp": "🇨", "h": "🇭", "hpp": "🇭", "cs": "🇨", "rb": "♦️",
    "php": "🐘", "pl": "🐪", "sql": "💾", "csv": "📊", "bat": "🦇",
    "cmd": "💲", "ini": "⚙️", "cfg": "⚙️", "conf": "⚙️"
};

// Define supported media extensions and text extensions
const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'ico'];
const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'];
const videoExtensions = ['mp4', 'webm', 'ogv', 'mov', 'avi', 'mkv', 'wmv']; // Browser support for some formats may vary
const textExtensions = ['txt', 'js', 'css', 'html', 'json', 'py', 'md', 'log', 'xml', 'yaml', 'yml', 'sh', 'java', 'c', 'cpp', 'h', 'hpp', 'cs', 'rb', 'php', 'pl', 'sql', 'csv', 'bat', 'cmd', 'ini', 'cfg', 'conf'];

/**
* Visszaadja a megfelelő ikont egy fájlnévhez a kiterjesztése alapján.
* @param {string} fileName - A fájl neve.
* @param {object} iconMap - A kiterjesztések ikonokhoz való térképe.
* @returns {string} Az ikon karakter (emoji).
*/
function getFileIcon(fileName, iconMap) {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) {
        return iconMap.default;
    }
    const extension = fileName.substring(lastDotIndex + 1).toLowerCase();
    return iconMap[extension] || iconMap.default;
}

/**
* Rekurzív aszinkron függvény, amely felépíti egy adott mappából kiindulva a fájlfa struktúra HTML elemeit.
* @param {FileSystemDirectoryHandle} directoryHandle - A feldolgozandó mappa handle-je.
* @param {object} iconMap - A kiterjesztések ikonokhoz való térképe.
* @param {HTMLElement} displayEl - A konténer elem, ahová az ablakokat kell helyezni.
* @returns {Promise<HTMLUListElement>} Egy Promise, amely az elkészült UL elemet adja vissza.
*/
async function buildTree(directoryHandle, iconMap, displayEl) {
    const ulElement = document.createElement('ul');

    try {
        const entries = [];
        for await (const entry of directoryHandle.values()) {
            entries.push(entry);
        }
        // Sort entries: folders first, then files, alphabetically within each group
        entries.sort((a, b) => {
            if (a.kind !== b.kind) { return a.kind === 'directory' ? -1 : 1; }
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });

        for (const handle of entries) {
             const name = handle.name;
            // Skip common hidden/system files/folders
            if (name.startsWith('.') || name === 'node_modules' || name === '$RECYCLE.BIN' || name === 'System Volume Information') { continue; }

            const liElement = document.createElement('li');
             liElement.dataset.kind = handle.kind;
             liElement.dataset.name = name;

            if (handle.kind === 'directory') {
                // --- Directory Handling ---
                const folderSpan = document.createElement('span');
                folderSpan.classList.add('folder');
                folderSpan.innerHTML = `<span class="toggle">▶</span> 📁 ${name}`;
                liElement.appendChild(folderSpan);
                liElement.classList.add('directory-li');

                folderSpan.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const parentLi = e.target.closest('li');
                    const childUl = parentLi.querySelector('ul');
                    if (childUl) {
                        childUl.classList.toggle('hidden');
                        parentLi.classList.toggle('open');
                    } else {
                        parentLi.classList.add('loading', 'open');
                        try {
                            const newUl = await buildTree(handle, iconMap, displayEl);
                            newUl.classList.add('nested');
                            parentLi.appendChild(newUl);
                        } catch (subError) {
                             console.error(`Error loading subdirectory content (${name}):`, subError);
                             parentLi.classList.remove('open'); // Revert open state on error
                             const errorLi = document.createElement('li');
                             errorLi.textContent = `🚫 Error reading content.`;
                             errorLi.style.color = 'red';
                             parentLi.appendChild(errorLi);
                        } finally {
                             parentLi.classList.remove('loading'); // Remove loading indicator
                        }
                    }
                 });

            } else if (handle.kind === 'file') {
                // --- File Handling ---
                const fileSpan = document.createElement('span');
                fileSpan.classList.add('file');
                const fileIcon = getFileIcon(name, iconMap);
                fileSpan.innerHTML = `${fileIcon} ${name}`;
                liElement.appendChild(fileSpan);
                liElement.classList.add('file-li');

                // --- File Click Listener ---
                fileSpan.addEventListener('click', async () => {
                    console.log(`File clicked: ${name}, Type: ${handle.kind}`);
                    let windowContent = '';
                    let windowId = `file-window-${directoryHandle.name}-${name}`.replace(/[^a-zA-Z0-9-_.]/g, '_');
                    let metadata = null; // For passing objectURL or other info

                    try {
                        const file = await handle.getFile();
                        const extension = name.split('.').pop()?.toLowerCase() || '';
                        console.log(`Opening file: ${name}, Ext: ${extension}, Size: ${file.size}, MIME: ${file.type}`);

                        // Limit file size (adjust as needed)
                        const MAX_FILE_SIZE = 150 * 1024 * 1024;
                        if (file.size > MAX_FILE_SIZE) {
                             console.warn(`File ${name} is too large (${file.size} bytes).`);
                             windowContent = `<div class="file-info-container error"><p class="file-info-title">File Too Large (${(file.size / 1024 / 1024).toFixed(1)} MB)</p><p>File: ${name}</p><p>Previews for very large files are disabled.</p></div>`;
                        } else {
                            // Determine file category
                            const isText = textExtensions.includes(extension) || file.type.startsWith('text/');
                            const isImage = imageExtensions.includes(extension) || file.type.startsWith('image/');
                            const isAudio = audioExtensions.includes(extension) || file.type.startsWith('audio/');
                            const isVideo = videoExtensions.includes(extension) || file.type.startsWith('video/');

                            // --- Text File Handling ---
                            if (isText) {
                                const textContent = await file.text();
                                const preElement = document.createElement('pre');
                                const codeElement = document.createElement('code');
                                codeElement.textContent = textContent;
                                let lang = 'plaintext';
                                if (extension && textExtensions.includes(extension)) { lang = extension; }
                                else { /* Basic MIME type guessing */
                                    if (file.type === 'application/json') lang = 'json'; else if (file.type.includes('xml')) lang = 'xml'; else if (file.type === 'text/html') lang = 'html'; else if (file.type === 'text/css') lang = 'css'; else if (file.type.includes('javascript')) lang = 'javascript';
                                }
                                codeElement.classList.add(`language-${lang}`);
                                preElement.appendChild(codeElement);
                                windowContent = preElement.outerHTML;
                                // Call highlightAll() slightly delayed after creating text window content
                                if (window.hljs) { try { setTimeout(() => { console.log("Running hljs.highlightAll"); hljs.highlightAll(); }, 50); } catch(e) { console.error("hljs error:", e);}}

                            // --- Image File Handling ---
                            } else if (isImage) {
                                const objectURL = URL.createObjectURL(file);
                                metadata = { objectURL: objectURL };
                                console.log(`Created objectURL for image: ${name}`);
                                windowContent = `<div class="image-viewer-container">
                                                     <img src="${objectURL}" alt="${name}" class="image-viewer-image">
                                                 </div>`;

                            // --- Audio File Handling ---
                            } else if (isAudio) {
                                const objectURL = URL.createObjectURL(file);
                                metadata = { objectURL: objectURL };
                                console.log(`Created objectURL for audio: ${name}`);
                                windowContent = `<div class="audio-player-container">
                                                    <p class="media-title">${name}</p>
                                                     <audio controls controlsList="nodownload" src="${objectURL}" class="audio-player">
                                                         Your browser does not support the audio element.
                                                     </audio>
                                                 </div>`;

                            // --- Video File Handling ---
                            } else if (isVideo) {
                                const objectURL = URL.createObjectURL(file);
                                metadata = { objectURL: objectURL };
                                console.log(`Created objectURL for video: ${name}`);
                                windowContent = `<div class="video-player-container">
                                                     <video controls controlsList="nodownload" src="${objectURL}" class="video-player" width="100%" height="auto">
                                                         Your browser does not support the video tag.
                                                     </video>
                                                     <p class="media-title">${name}</p>
                                                 </div>`;

                            // --- Fallback for other types ---
                            } else {
                                windowContent = `<div class="file-info-container"><p class="file-info-title">Cannot display preview</p><p>File: ${name}</p><p>Type: .${extension || 'Unknown'}</p><p>MIME: ${file.type || 'N/A'}</p><p>Size: ${file.size.toLocaleString()} bytes</p></div>`;
                            }
                        } // End file size check

                        // --- Create the window ---
                        createWindow(
                            windowId,
                            name,
                            windowContent,
                            displayEl,
                            metadata // Pass objectURL (if created) for cleanup
                        );

                    } catch (error) {
                        console.error(`Error reading or displaying file ${name}:`, error);
                        createWindow( `error-${windowId}`, `Error: ${name}`, `<div class="file-info-container error"><p class="file-info-title">Error</p><p>Could not read/display file.</p><p>Error: ${error.message}</p></div>`, displayEl);
                    }
                }); // End file click listener
            } // End file handling

            ulElement.appendChild(liElement);
        } // End loop through sorted directory entries

    } catch (loopError) {
        console.error(`Error reading directory entries (${directoryHandle.name}):`, loopError);
        const errorLi = document.createElement('li'); errorLi.textContent = `🚫 Error reading folder content. Check console.`; errorLi.style.color = 'red'; ulElement.appendChild(errorLi);
    }

    return ulElement;
}

// --- Main Logic ---
if (!window.showDirectoryPicker) {
    alert("Your browser does not support the File System Access API. Please use a modern browser like Chrome or Edge.");
    const selectBtn = document.getElementById('selectBtn'); if (selectBtn) selectBtn.disabled = true;
    const treeContainer = document.getElementById('treeContainer'); if (treeContainer) treeContainer.innerHTML = '<p style="color: red;">File System Access API not supported.</p>';
} else {
    const selectBtn = document.getElementById('selectBtn');
    const treeContainer = document.getElementById('treeContainer');
    const displayContainer = document.getElementById('display');
    if (!selectBtn || !treeContainer || !displayContainer) {
        console.error("CRITICAL ERROR: Missing required HTML element: 'selectBtn', 'treeContainer', or 'display'."); alert("Initialization failed: Required page elements are missing.");
    } else {
        selectBtn.addEventListener('click', async () => {
             treeContainer.innerHTML = '<p>Selecting folder...</p>'; let rootDirectoryHandle = null;
             try { rootDirectoryHandle = await window.showDirectoryPicker({ id: 'uniqueDirPicker', mode: 'read' }); }
             catch (error) { if (error.name === 'AbortError') { treeContainer.innerHTML = '<p>Folder selection cancelled. Select again to load.</p>'; } else { console.error("Err select folder:", error); treeContainer.innerHTML = `<p class="error" style="color:red;">Error selecting folder: ${error.message}</p>`; } return; }
             if (rootDirectoryHandle) {
                 treeContainer.innerHTML = `<p>Loading "<b>${rootDirectoryHandle.name}</b>"...</p>`;
                 try { const treeEl = await buildTree(rootDirectoryHandle, fileIconsMap, displayContainer); treeContainer.innerHTML = ''; treeEl.classList.add('tree-root'); treeContainer.appendChild(treeEl); }
                 catch (error) { console.error("Err build tree:", error); treeContainer.innerHTML = `<p class="error" style="color:red;">Error loading structure: ${error.message}</p>`; }
             }
         });
    }
}
// --- END OF FILE tree.js ---