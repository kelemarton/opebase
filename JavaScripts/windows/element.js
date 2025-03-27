// Creates the basic DOM structure for a window

/**
 * Creates the window DOM element without attaching interaction/taskbar logic.
 * @param {string} id - The unique ID for the window.
 * @param {string} title - The window title.
 * @param {string} content - HTML content for the window body.
 * @param {Function} minimizeHandler - Function to call when minimize is clicked.
 * @param {Function} maximizeHandler - Function to call when maximize is clicked.
 * @param {Function} closeHandler - Function to call when close is clicked.
 * @returns {HTMLElement} The created window element.
 */
export function createWindowElement(id, title, content, minimizeHandler, maximizeHandler, closeHandler) {
    const win = document.createElement('div');
    win.className = 'window'; // Base class, animations managed by windowManager
    win.dataset.windowId = id;

    // --- Header ---
    const header = document.createElement('div');
    header.className = 'window-header';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'window-title';
    titleSpan.textContent = title;

    const controls = document.createElement('div');
    controls.className = 'window-controls';

    const minimizeBtn = document.createElement('div');
    minimizeBtn.className = 'window-control minimize';
    minimizeBtn.title = 'Minimize';
    minimizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        minimizeHandler(win); // Call provided handler
    });

    const maximizeBtn = document.createElement('div');
    maximizeBtn.className = 'window-control maximize';
    maximizeBtn.title = 'Maximize';
    maximizeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        maximizeHandler(win); // Call provided handler
    });

    const closeBtn = document.createElement('div');
    closeBtn.className = 'window-control close';
    closeBtn.title = 'Close';
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeHandler(win); // Call provided handler
    });

    controls.append(minimizeBtn, maximizeBtn, closeBtn);
    header.append(titleSpan, controls);

    // --- Content Area ---
    const contentDiv = document.createElement('div');
    contentDiv.className = 'window-content';
    contentDiv.innerHTML = content;

    // --- Resizer ---
    const resizer = document.createElement('div');
    resizer.className = 'resizer bottom-right';

    // --- Append ---
    win.append(header, contentDiv, resizer);

    return win;
}