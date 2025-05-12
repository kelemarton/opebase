// Handles debug window creation trigger

import { createWindow } from './manage.js'; // Needs main creator function
import { getHighestZIndex } from './state.js'; // To display z-index info
import { windows } from './state.js'; // To display window count

let debugWindowCounter = 0;
let displayElement = null; // Cache display element

/**
 * Initializes the debug module.
 * @param {HTMLElement} displayContainer - The main display element.
 */
export function initDebug(displayContainer) {
    displayElement = displayContainer;
    document.addEventListener('keydown', handleDebugKeyPress);
}

function handleDebugKeyPress(event) {
     if (!displayElement) return; // Don't run if not initialized

    if (event.key.toLowerCase() === 'p') {
        const target = event.target;
        const isInputting = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        if (isInputting) return;

        debugWindowCounter++;
        const newDebugId = `debug_${Date.now()}`;
        const debugWindowTitle = `Debug Console ${debugWindowCounter}`;

        // Get current active window ID for display
        const activeWinElement = document.querySelector('.window.active'); // Or get from windowManager state if possible
        const activeWinId = activeWinElement ? activeWinElement.dataset.windowId : 'None';

        let debugContent = `<h4>Debug Info (${debugWindowCounter})</h4>
            <p style="font-size: 11px;">ID: ${newDebugId}</p>
            <p style="font-size: 11px;">Timestamp: ${new Date().toISOString()}</p>
            <p style="font-size: 11px;">Active Window ID: ${activeWinId}</p>
            <p style="font-size: 11px;">Total Windows: ${Object.keys(windows).length + 1}</p>
            <p style="font-size: 11px;">Highest Z-Index: ${getHighestZIndex() + 1}</p>
            <div id="debug-log-area-${newDebugId}" style="height: 120px; overflow-y: scroll; border: 1px solid #777; background: #333; padding: 5px; font-size: 12px; margin-top: 10px; color: #eee; font-family: monospace;">Log...<br></div>`;

        // Call main createWindow, passing the display element
        const newDebugWin = createWindow(newDebugId, debugWindowTitle, debugContent, displayElement);

        if (newDebugWin) {
            // Customize position/size
            newDebugWin.style.width = '450px'; newDebugWin.style.height = '350px';
            const offset = (debugWindowCounter % 8) * 25;
            newDebugWin.style.top = `${80 + offset}px`; newDebugWin.style.left = `${280 + offset}px`;
            // keepWithinBounds(newDebugWin, displayElement); // createWindow calls this now

            // Log creation message
            const winContent = newDebugWin.querySelector('.window-content');
            const specificLogArea = winContent ? winContent.querySelector(`#debug-log-area-${newDebugId}`) : null;
            if (specificLogArea) {
                const logEntry = document.createElement('div');
                logEntry.textContent = `${new Date().toLocaleTimeString()}: Debug window ${debugWindowCounter} created.`;
                specificLogArea.innerHTML = ''; specificLogArea.appendChild(logEntry);
                specificLogArea.scrollTop = specificLogArea.scrollHeight;
            }
        }
    }
}