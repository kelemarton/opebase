// =============== JavaScripts/windowManager.js ===============
// Central orchestrator for window management, state, and animations

import { windows, getHighestZIndex, incrementZIndex } from './state.js';
import { createWindowElement } from './element.js';
import { attachDragHandler, attachResizeHandler } from './interaction.js';
import { createTaskbarItem } from './taskbar.js';

// --- State ---
let activeWindow = null; // Manages the currently active window element

// --- Utility (Keep or move to utils.js) ---
function keepWithinBounds(win, displayEl) {
    if (!win || !displayEl) return;
    try {
        const displayRect = displayEl.getBoundingClientRect();
        const winWidth = win.offsetWidth; const winHeight = win.offsetHeight;
        // Ensure dimensions are valid numbers
        if (isNaN(winWidth) || isNaN(winHeight)) return;

        let currentLeft = win.offsetLeft; let currentTop = win.offsetTop;
        // Ensure positions are valid numbers
        if (isNaN(currentLeft)) currentLeft = 0;
        if (isNaN(currentTop)) currentTop = 0;

        // Check boundaries
        if (currentLeft + winWidth > displayRect.width) { currentLeft = displayRect.width - winWidth; }
        if (currentTop + winHeight > displayRect.height) { currentTop = displayRect.height - winHeight; }
        if (currentLeft < 0) { currentLeft = 0; }
        if (currentTop < 0) { currentTop = 0; }
        // Apply corrected position only if changed and valid
        if (win.offsetLeft !== currentLeft && !isNaN(currentLeft)) { win.style.left = `${currentLeft}px`; }
        if (win.offsetTop !== currentTop && !isNaN(currentTop)) { win.style.top = `${currentTop}px`; }
    } catch (error) {
        console.error("Error in keepWithinBounds:", error, { win, displayEl });
    }
}

/** Finds the DOM element for a window, accepting ID or element */
function findWindowElement(idOrElement) {
    if (typeof idOrElement === 'string') {
        return windows[idOrElement]?.element;
    }
    return idOrElement instanceof HTMLElement ? idOrElement : null; // Ensure it's an element
}

/** Finds the window data object, accepting ID or element */
function findWindowData(idOrElement) {
     if (typeof idOrElement === 'string') {
        return windows[idOrElement];
    }
    // If element, find its ID first
    const id = idOrElement?.dataset?.windowId;
    return id ? windows[id] : null;
}


// --- Main API Functions ---

/**
 * Creates a new window with all interactions and adds it to the system.
 * @param {string} id - Unique window ID.
 * @param {string} title - Window title.
 * @param {string} content - Window HTML content.
 * @param {HTMLElement} displayEl - The display container element.
 * @returns {HTMLElement|null} The created window element or null if exists.
 */
export function createWindow(id, title, content, displayEl) {
    if (!displayEl) {
        console.error("createWindow called without a valid displayEl");
        return null;
    }
    if (windows[id]) {
        if (!id.startsWith('debug_')) { console.warn(`Window with id ${id} already exists. Focusing instead.`); }
        focusWindow(id); // Focus existing
        return windows[id].element;
    }

    // 1. Create basic element structure using element.js
    // This should now create all 4 resizer divs based on the previous update to element.js
    const win = createWindowElement(
        id, title, content,
        minimizeWindow, // Pass reference to windowManager's function
        maximizeWindow, // Pass reference
        closeWindow     // Pass reference
    );

    // 2. Set initial styles and state
    win.style.zIndex = incrementZIndex();
    win.style.width = '400px'; win.style.height = '300px'; // Example initial size
    const offset = (Object.keys(windows).length % 10) * 20;
    win.style.top = `${50 + offset}px`; win.style.left = `${50 + offset}px`;
    win.style.opacity = '0'; win.style.transform = 'scale(0.8)';

    // 3. Attach interaction listeners
    const header = win.querySelector('.window-header');
    // *** CORRECTION START ***
    // Use querySelectorAll to get a NodeList of ALL elements with the 'resizer' class
    const resizers = win.querySelectorAll('.resizer');
    // *** CORRECTION END ***

    if (header) {
        attachDragHandler(header); // Attach drag to header
    }

    // *** CORRECTION START ***
    // Pass the entire NodeList (all found resizer elements) to attachResizeHandler
    if (resizers && resizers.length > 0) {
         console.log(`Attaching resize handlers to ${resizers.length} elements for window ${id}`); // Debug log
        attachResizeHandler(resizers);
    } else {
        console.warn(`Did not find any .resizer elements for window ${id}`);
    }
    // *** CORRECTION END ***


    // 4. Add focus listener to the main window element
    win.addEventListener('mousedown', () => focusWindow(win));

    // 5. Create taskbar item
    const taskbarItem = createTaskbarItem(id, title); // Assumes taskbar.js adds it to DOM

    // 6. Store window data
    windows[id] = {
        element: win,
        taskbarItem: taskbarItem,
        isMinimized: false,
        isMaximized: false,
        originalRect: null
    };

    // 7. Add to display and trigger animation
    displayEl.appendChild(win);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if(windows[id]) { // Check if still exists (wasn't closed immediately)
                win.style.opacity = '1';
                win.style.transform = 'scale(1)';
            }
        });
    });

    // 8. Set as active and ensure bounds
    setActiveWindow(win); // Internal function to set active state
    keepWithinBounds(win, displayEl); // Apply bounds check

    return win; // Return the created window element
}


export function focusWindow(idOrElement) {
    const win = findWindowElement(idOrElement);
    const winData = findWindowData(win);
    if (!win || !winData) return;

    let needsActiveSet = false;

    // --- Handle Un-minimizing Animation (Fly from taskbar) ---
    if (winData.isMinimized) {
        const taskbarItem = winData.taskbarItem;

        // Clean up potentially stale classes
        win.classList.remove('minimizing', 'is-dragging', 'is-resizing');

        // --- Calculate starting position (same logic as minimizing) ---
        if (taskbarItem) {
            try {
                const taskbarRect = taskbarItem.getBoundingClientRect();
                const displayRect = win.offsetParent?.getBoundingClientRect(); // Get display bounds

                if (displayRect) {
                    // Estimate where the window *will be* when restored
                    // Use current style for target position/size, careful with % or auto
                    let targetX = parseFloat(win.style.left || 0);
                    let targetY = parseFloat(win.style.top || 0);
                    let targetW = parseFloat(win.style.width || 400); // Use default or last known good width
                    let targetH = parseFloat(win.style.height || 300); // Use default or last known good height

                    // Approximation: Use center of target restored position relative to viewport
                    let targetCenterX = displayRect.left + targetX + targetW / 2;
                    let targetCenterY = displayRect.top + targetY + targetH / 2;

                    // Taskbar center relative to viewport
                    const taskbarCenterX = taskbarRect.left + taskbarRect.width / 2;
                    const taskbarCenterY = taskbarRect.top + taskbarRect.height / 2;

                    const deltaX = taskbarCenterX - targetCenterX;
                    const deltaY = taskbarCenterY - targetCenterY;

                    // Set CSS variables to position it *at* the taskbar initially via transform
                    win.style.setProperty('--minimize-translate-x', `${deltaX}px`);
                    win.style.setProperty('--minimize-translate-y', `${deltaY}px`);
                } else {
                     throw new Error("Cannot get display bounds"); // Fallback if displayRect fails
                }
            } catch (error) {
                 console.error("Error calculating unminimize start position:", error);
                 // Fallback start position
                 win.style.setProperty('--minimize-translate-x', `0px`);
                 win.style.setProperty('--minimize-translate-y', `-100px`); // Fly roughly from top
            }
        } else {
             // Fallback start position if no taskbar item
             win.style.setProperty('--minimize-translate-x', `0px`);
             win.style.setProperty('--minimize-translate-y', `-100px`);
        }
        // --- End Calculation ---

        // Apply initial animation state (Opacity 0, Scaled down, Translated via CSS vars)
        win.style.opacity = '0';
        // Apply the 'minimizing' class's transform state directly via style before display
        win.style.transform = `translate(var(--minimize-translate-x), var(--minimize-translate-y)) scale(0.1)`;
        win.style.display = 'flex'; // Make visible BEFORE animation

        // Update state flags immediately
        winData.isMinimized = false;
        if (winData.taskbarItem) winData.taskbarItem.classList.remove('minimized');
        needsActiveSet = true;

        // Trigger transition back to normal state (Opacity 1, Scale 1, Translate 0)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if(windows[winData.element.dataset.windowId]) { // Check using ID
                    win.style.opacity = '1';
                    win.style.transform = 'scale(1) translate(0, 0)'; // Animate back to default transform
                }
            });
        });

         // Clean up CSS variables after animation might start
         setTimeout(() => {
             win.style.removeProperty('--minimize-translate-x');
             win.style.removeProperty('--minimize-translate-y');
         }, 400); // Corresponds to 0.35s transition + buffer

    }
    // --- End Un-minimizing ---

    // Bring to front (rest of function is the same)
    if (activeWindow !== win) {
        win.style.zIndex = incrementZIndex();
        needsActiveSet = true;
    }

    if (needsActiveSet) {
        setActiveWindow(win);
    }
}


export function closeWindow(idOrElement) {
    const win = findWindowElement(idOrElement);
    const winData = findWindowData(win);
    const id = win?.dataset?.windowId;

    // Guard clause: Check if window/data exists and isn't already closing/minimizing
    if (!win || !winData || !id || !windows[id] || win.classList.contains('closing') || win.classList.contains('minimizing')) {
        return;
    }

    // ***** START CHANGE *****
    // --- Remove Taskbar Item Immediately ---
    // Regardless of whether the window is minimized or visible, remove the taskbar item now.
    winData.taskbarItem?.remove();
    // Important: Nullify the reference in the state so cleanup doesn't try to remove it again
    if (winData) {
        winData.taskbarItem = null;
    }
    // ***** END CHANGE *****


    // --- Handle Minimized Window ---
    if (winData.isMinimized) {
        // Taskbar item is already removed above.
        // Just remove the window element and state data.
        win.remove();
        delete windows[id];
        if (activeWindow === win) {
            activeWindow = null;
            findTopWindowAndFocus();
        }
        return; // Exit early, no animation needed for window
    }
    // --- END Minimized Handling ---


    // --- Animation Logic for VISIBLE Windows ---

    // Prevent interaction during close
    win.style.pointerEvents = 'none';

    // Clean up potentially interfering styles/classes
    win.classList.remove('is-dragging', 'is-resizing');
    win.style.removeProperty('--minimize-translate-x');
    win.style.removeProperty('--minimize-translate-y');

    // Add 'closing' class to trigger window CSS transition
    win.classList.add('closing');
    // (Taskbar item class addition removed)


    // Define the cleanup function (runs after window animation)
    const cleanup = (event) => {
        // Ensure the event fired on the window itself
        if (event && event.target !== win) return;

        // Check if state still exists (safety check)
        if (windows[id]) {
            win.remove(); // Remove window from DOM
            // (Taskbar item removal moved earlier)
            delete windows[id]; // Delete state

            if (activeWindow === win) {
                activeWindow = null;
                findTopWindowAndFocus();
            }
        }
        // Remove listeners
        win.removeEventListener('transitionend', cleanup);
        win.removeEventListener('transitioncancel', cleanup);
    };

    // Listen for the WINDOW's transition to end OR cancel
    win.addEventListener('transitionend', cleanup, { once: true });
    win.addEventListener('transitioncancel', cleanup, { once: true });

    // Safety Timeout (remains the same)
    setTimeout(() => {
        if (document.body.contains(win) && windows[id] && win.classList.contains('closing')) {
            cleanup(null);
        }
    }, 400); // Adjust time slightly longer than the CSS transition duration

} // end of closeWindow

export function minimizeWindow(idOrElement) {
    const win = findWindowElement(idOrElement);
    const winData = findWindowData(win);
    // Prevent minimizing if already minimized or during closing/minimizing animation
    if (!win || !winData || winData.isMinimized || win.classList.contains('closing') || win.classList.contains('minimizing')) return;

    const id = win.dataset.windowId; // Get ID

    // Handle Restore if Maximized BEFORE Minimizing (Instantly)
    if (winData.isMaximized) {
        // Temporarily disable transitions for instant restore
        win.classList.add('is-resizing'); // Use this class to disable transition
        void win.offsetWidth; // Force reflow

        win.classList.remove('maximized');
        if (winData.originalRect) {
             win.style.top = winData.originalRect.top; win.style.left = winData.originalRect.left;
             win.style.width = winData.originalRect.width; win.style.height = winData.originalRect.height;
        }
        winData.isMaximized = false; winData.originalRect = null;

         // Remove resizing class and start minimize animation in the next frame(s)
         requestAnimationFrame(() => {
             win.classList.remove('is-resizing'); // Re-enable transitions
             requestAnimationFrame(() => { // Ensure transition is re-enabled
                 if(windows[id] && !win.classList.contains('minimizing')) {
                     startMinimizeAnimation(win, winData); // Internal helper
                 }
             });
        });
    } else {
        // If not maximized, start minimize animation directly
        startMinimizeAnimation(win, winData); // Internal helper
    }
}


export function maximizeWindow(idOrElement) {
    const win = findWindowElement(idOrElement);
    const winData = findWindowData(win);
    // Prevent action if animating or no data
    if (!win || !winData || win.classList.contains('closing') || win.classList.contains('minimizing')) return;

    const id = win.dataset.windowId; // Get ID

    // Ensure transitions are enabled & clean up minimize vars
    win.classList.remove('is-dragging', 'is-resizing');
    win.style.removeProperty('--minimize-translate-x');
    win.style.removeProperty('--minimize-translate-y');


    if (winData.isMaximized) {
        // --- Restore ---
        win.classList.remove('maximized'); // CSS transition applies
        if (winData.originalRect) {
            win.style.top = winData.originalRect.top; win.style.left = winData.originalRect.left;
            win.style.width = winData.originalRect.width; win.style.height = winData.originalRect.height;
         }
        winData.isMaximized = false; winData.originalRect = null;
    } else {
        // --- Maximize ---
        if (!winData.isMinimized) {
             // Store current state BEFORE maximizing
             winData.originalRect = {
                top: win.style.top || `${win.offsetTop}px`, left: win.style.left || `${win.offsetLeft}px`,
                width: `${win.offsetWidth}px`, height: `${win.offsetHeight}px`
             };
             win.classList.add('maximized'); // CSS transition applies
             winData.isMaximized = true;
             focusWindow(win); // Needs element
        } else {
            // Unminimize first, then maximize after delay
            focusWindow(win); // Needs element, starts unminimize animation
            // Wait for unminimize animation to likely finish
            setTimeout(() => {
                // Use ID and data for checks after timeout
                const currentWinData = windows[id];
                if (currentWinData && !currentWinData.isMinimized) {
                    maximizeWindow(win); // Needs element
                }
            }, 300); // Adjust timeout based on transition duration
        }
    }
}

// --- Internal Helper Functions ---

function startMinimizeAnimation(win, winData) {
    // Ensure no conflicting animations are running & remove manipulation classes
    if (win.classList.contains('closing') || win.classList.contains('minimizing')) return;
    win.classList.remove('is-dragging', 'is-resizing');

    const id = win.dataset.windowId;
    const taskbarItem = winData.taskbarItem;

    // --- Calculate Translation Target ---
    if (taskbarItem) {
        try {
            const winRect = win.getBoundingClientRect();
            const taskbarRect = taskbarItem.getBoundingClientRect();

            if (winRect.width === 0 && winRect.height === 0) { // Check if bounds are valid
                 throw new Error("Window bounds are zero, cannot calculate minimize path.");
            }

            // Calculate centers relative to viewport
            const winCenterX = winRect.left + winRect.width / 2;
            const winCenterY = winRect.top + winRect.height / 2;
            const taskbarCenterX = taskbarRect.left + taskbarRect.width / 2;
            const taskbarCenterY = taskbarRect.top + taskbarRect.height / 2;

            const deltaX = taskbarCenterX - winCenterX;
            const deltaY = taskbarCenterY - winCenterY;

            // Set CSS variables on the window element
            win.style.setProperty('--minimize-translate-x', `${deltaX}px`);
            win.style.setProperty('--minimize-translate-y', `${deltaY}px`);
        } catch (error) {
             console.error("Error calculating minimize path:", error);
             win.style.setProperty('--minimize-translate-x', `0px`);
             win.style.setProperty('--minimize-translate-y', `-100px`); // Fallback: Fly Up
        }
    } else {
        console.warn("Taskbar item not found for minimize animation fallback.");
        win.style.setProperty('--minimize-translate-x', `0px`);
        win.style.setProperty('--minimize-translate-y', `-100px`); // Fallback: Fly Up
    }
    // --- End Calculation ---

    // 1. Add 'minimizing' class
    win.classList.add('minimizing');

    // 2. Define the cleanup function
    const cleanup = (event) => {
        // IMPORTANT: Ensure the event fired on the window itself
        if (event && event.target !== win) return;

        // 3. Hide element and update state AFTER animation
        if(windows[id]) { // Use ID
            win.style.display = 'none';
            winData.isMinimized = true;
            if(winData.taskbarItem) { // Check taskbar item exists
                 winData.taskbarItem.classList.add('minimized');
                 winData.taskbarItem.classList.remove('active');
            }
            win.classList.remove('minimizing'); // Remove class AFTER hiding

            // Reset CSS variables
            win.style.removeProperty('--minimize-translate-x');
            win.style.removeProperty('--minimize-translate-y');

            if (activeWindow === win) {
                activeWindow = null;
                findTopWindowAndFocus();
            }
        }
        // Remove listeners
        win.removeEventListener('transitionend', cleanup);
        win.removeEventListener('transitioncancel', cleanup);
    };

    // 3. Listen for transition end OR cancel
    win.addEventListener('transitionend', cleanup, { once: true });
    win.addEventListener('transitioncancel', cleanup, { once: true });
}


function setActiveWindow(win) { // Internal state update
    // Deactivate previous
    if (activeWindow && windows[activeWindow.dataset.windowId]) {
        const oldWinData = windows[activeWindow.dataset.windowId];
        if(oldWinData && oldWinData.taskbarItem) {
             oldWinData.taskbarItem.classList.remove('active');
        }
    }
    // Set new
    activeWindow = win; // Store the element reference
    if (win && windows[win.dataset.windowId]) {
        const newWinData = windows[win.dataset.windowId];
        if (newWinData && newWinData.taskbarItem) {
            newWinData.taskbarItem.classList.remove('minimized');
            newWinData.taskbarItem.classList.add('active');
        }
    }
}

function findTopWindowAndFocus() { // Internal helper
    let topWinElement = null;
    let maxZ = -1;
    for (const id in windows) {
        // Consider only windows that are not minimized AND not currently animating closed/minimized
        const winData = windows[id];
        if (winData && !winData.isMinimized &&
            winData.element &&
            !winData.element.classList.contains('closing') &&
            !winData.element.classList.contains('minimizing'))
        {
            const z = parseInt(winData.element.style.zIndex || 0);
            if (z > maxZ) {
                maxZ = z;
                topWinElement = winData.element;
            }
        }
    }
    setActiveWindow(topWinElement); // Update internal active state
}

// --- Pass display element to keepWithinBounds ---
// (This function remains outside the class/module scope if defined globally)
// Or ensure it's passed correctly if imported