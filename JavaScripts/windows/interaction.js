// JavaScripts/windows/interaction.js
// Handles window dragging and resizing logic

import { focusWindow } from './manage.js'; // Import function to handle focus
import { windows } from './state.js'; // Access state if needed (e.g., check isMaximized)

// --- Dragging State ---
let isDragging = false;
let dragTarget = null;      // The window element being dragged
let dragOffsetX, dragOffsetY; // Mouse offset within the header
let dragDisplayRectCache = null; // Cached bounds of the display area during drag

// --- Resizing State ---
let isResizing = false;
let resizeTarget = null;      // The window element being resized
let resizeHandle = null;      // The specific resizer div that was clicked
let resizeType = null;        // Type of resize ('tl', 'tr', 'bl', 'br')
let resizeStartX, resizeStartY; // Mouse start position for resize
let resizeInitialWidth, resizeInitialHeight; // Window dimensions at resize start
let resizeInitialLeft, resizeInitialTop;   // Window position at resize start
// --------------------

let displayElement = null; // To cache the display area element

/**
 * Initializes the interaction module with the display container.
 * @param {HTMLElement} displayContainer - The main display area element (#display).
 */
export function initInteraction(displayContainer) {
    displayElement = displayContainer;
    if (!displayElement) {
        console.error("Interaction module initialized without a valid display container.");
    }
}

// --- Dragging Logic ---

function startDrag(e) {
    // Only react to left mouse button and if displayElement is set
    if (e.button !== 0 || !displayElement) return;

    // Find the closest parent window element
    const target = e.target.closest('.window');

    // Prevent drag if window not found, is maximized, or is animating
    if (!target || windows[target.dataset.windowId]?.isMaximized || target.classList.contains('closing') || target.classList.contains('minimizing')) {
        dragTarget = null;
        return;
    }

    // Prevent starting drag if clicking on a window control button
    if (e.target.closest('.window-control')) {
        return;
    }

    e.preventDefault(); // Prevent text selection during drag

    dragTarget = target;
    focusWindow(dragTarget); // Bring window to front and set active state

    isDragging = true;
    dragDisplayRectCache = displayElement.getBoundingClientRect(); // Cache display bounds
    const targetRect = dragTarget.getBoundingClientRect(); // Get window bounds relative to viewport

    // Calculate mouse offset relative to the window's top-left corner
    dragOffsetX = e.clientX - targetRect.left;
    dragOffsetY = e.clientY - targetRect.top;

    dragTarget.classList.add('is-dragging'); // Add class to disable CSS transitions

    // Add listeners to the document to track mouse movement everywhere
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mouseleave', stopDrag); // Stop if mouse leaves the browser window

    // Style changes for visual feedback
    dragTarget.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none'; // Prevent text selection globally
}

function doDrag(e) {
    if (!isDragging || !dragTarget || !dragDisplayRectCache) return;

    // Calculate desired top-left position in viewport coordinates
    const desiredViewportX = e.clientX - dragOffsetX;
    const desiredViewportY = e.clientY - dragOffsetY;

    // Convert viewport coordinates to coordinates relative to the displayElement
    let newLeft = desiredViewportX - dragDisplayRectCache.left;
    let newTop = desiredViewportY - dragDisplayRectCache.top;

    // Get window dimensions
    const winWidth = dragTarget.offsetWidth;
    const winHeight = dragTarget.offsetHeight;

    // Calculate maximum allowed positions to keep window within display bounds
    const maxLeft = dragDisplayRectCache.width - winWidth;
    const maxTop = dragDisplayRectCache.height - winHeight;

    // Clamp position within display bounds (0, 0) to (maxLeft, maxTop)
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    // Apply the new position
    dragTarget.style.left = `${newLeft}px`;
    dragTarget.style.top = `${newTop}px`;
}

function stopDrag() {
    if (isDragging && dragTarget) {
        // Restore original cursor and re-enable transitions
        dragTarget.style.cursor = '';
        dragTarget.classList.remove('is-dragging');
    }
    // Reset dragging state
    isDragging = false;
    dragTarget = null;
    dragDisplayRectCache = null;

    // Remove document-level listeners
    document.removeEventListener('mousemove', doDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('mouseleave', stopDrag);

    // Restore global text selection
    document.body.style.userSelect = '';
}

// --- Resizing Logic ---

function startResize(e) {
    // Only react to left mouse button and if displayElement is set
    if (e.button !== 0 || !displayElement) return;

    // The event target should be the resizer handle itself
    const handle = e.target;
    if (!handle || !handle.classList.contains('resizer')) return;

    // Find the parent window
    const target = handle.closest('.window');

    // Prevent resize if window not found, is maximized, or is animating
    if (!target || windows[target.dataset.windowId]?.isMaximized || target.classList.contains('closing') || target.classList.contains('minimizing')) {
        resizeTarget = null;
        return;
    }

    e.preventDefault(); // Prevent default actions like text selection
    e.stopPropagation(); // Stop event from bubbling up (e.g., to window mousedown)

    resizeTarget = target;
    resizeHandle = handle; // Store the specific handle being dragged
    focusWindow(resizeTarget); // Bring window to front

    isResizing = true;

    // Record initial mouse position and window geometry
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeInitialWidth = resizeTarget.offsetWidth;
    resizeInitialHeight = resizeTarget.offsetHeight;
    resizeInitialLeft = resizeTarget.offsetLeft; // Position relative to parent (#display)
    resizeInitialTop = resizeTarget.offsetTop;

    // Determine the type of resize based on the handle's classes
    if (handle.classList.contains('top-left')) resizeType = 'tl';
    else if (handle.classList.contains('top-right')) resizeType = 'tr';
    else if (handle.classList.contains('bottom-left')) resizeType = 'bl';
    else if (handle.classList.contains('bottom-right')) resizeType = 'br';
    else { // Fallback - should not happen with current setup
        console.warn("Unknown resizer type clicked:", handle.className);
        isResizing = false;
        resizeTarget = null;
        resizeHandle = null;
        return;
    }

    resizeTarget.classList.add('is-resizing'); // Disable CSS transitions during resize

    // Add listeners to the document for tracking
    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('mouseleave', stopResize); // Stop if mouse leaves browser

    // Set global styles for feedback
    document.body.style.userSelect = 'none';
    // Set body cursor to match the cursor style defined for the specific handle in CSS
    document.body.style.cursor = getComputedStyle(handle).cursor;
}

function doResize(e) {
    if (!isResizing || !resizeTarget || !resizeType || !displayElement) return;

    // Calculate change in mouse position
    const deltaX = e.clientX - resizeStartX;
    const deltaY = e.clientY - resizeStartY;

    // Get constraints
    const displayRect = displayElement.getBoundingClientRect(); // Use current bounds
    const computedStyle = getComputedStyle(resizeTarget);
    const minWidth = parseInt(computedStyle.minWidth) || 150; // Get min dimensions from CSS or use default
    const minHeight = parseInt(computedStyle.minHeight) || 100;

    // Initialize new geometry based on initial state
    let newWidth = resizeInitialWidth;
    let newHeight = resizeInitialHeight;
    let newLeft = resizeInitialLeft;
    let newTop = resizeInitialTop;

    // --- Calculate new dimensions and position based on resize type ---
    if (resizeType.includes('r')) { // Resizing involves the right edge (tr, br)
        newWidth = resizeInitialWidth + deltaX;
    } else if (resizeType.includes('l')) { // Resizing involves the left edge (tl, bl)
        newWidth = resizeInitialWidth - deltaX;
        newLeft = resizeInitialLeft + deltaX; // Position must move with edge
    }

    if (resizeType.includes('b')) { // Resizing involves the bottom edge (bl, br)
        newHeight = resizeInitialHeight + deltaY;
    } else if (resizeType.includes('t')) { // Resizing involves the top edge (tl, tr)
        newHeight = resizeInitialHeight - deltaY;
        newTop = resizeInitialTop + deltaY; // Position must move with edge
    }

    // --- Apply Minimum Size Constraints ---
    // If resizing from left/top makes width/height too small, adjust position too
    if (newWidth < minWidth) {
        if (resizeType.includes('l')) {
            newLeft = resizeInitialLeft + (resizeInitialWidth - minWidth); // Adjust left edge
        }
        newWidth = minWidth;
    }
    if (newHeight < minHeight) {
         if (resizeType.includes('t')) {
            newTop = resizeInitialTop + (resizeInitialHeight - minHeight); // Adjust top edge
         }
        newHeight = minHeight;
    }

    // --- Apply Display Boundary Constraints ---
    // Check Left boundary
    if (newLeft < 0) {
        if (resizeType.includes('l')) newWidth = resizeInitialLeft + resizeInitialWidth; // Recalc width based on initial right edge
        newLeft = 0;
    }
    // Check Top boundary
    if (newTop < 0) {
        if (resizeType.includes('t')) newHeight = resizeInitialTop + resizeInitialHeight; // Recalc height based on initial bottom edge
        newTop = 0;
    }
    // Check Right boundary
    if (newLeft + newWidth > displayRect.width) {
        if (resizeType.includes('r')) { // Resizing right edge: clamp width
            newWidth = displayRect.width - newLeft;
        } else if (resizeType.includes('l')) { // Resizing left edge: push left edge back
            newLeft = displayRect.width - newWidth;
        }
    }
    // Check Bottom boundary
    if (newTop + newHeight > displayRect.height) {
        if (resizeType.includes('b')) { // Resizing bottom edge: clamp height
            newHeight = displayRect.height - newTop;
        } else if (resizeType.includes('t')) { // Resizing top edge: push top edge back
            newTop = displayRect.height - newHeight;
        }
    }

    // --- Final pass for minimum dimensions AFTER boundary adjustments ---
    // This might be needed if boundary adjustments pushed position but not size
    newWidth = Math.max(minWidth, newWidth);
    newHeight = Math.max(minHeight, newHeight);
    // Re-check boundaries if minimum size enforcement changed dimensions again
     if (newLeft < 0) { newLeft = 0; }
     if (newTop < 0) { newTop = 0; }
     if (newLeft + newWidth > displayRect.width) { newWidth = displayRect.width - newLeft; }
     if (newTop + newHeight > displayRect.height) { newHeight = displayRect.height - newTop; }


    // Apply the final calculated styles
    resizeTarget.style.width = `${newWidth}px`;
    resizeTarget.style.height = `${newHeight}px`;
    resizeTarget.style.left = `${newLeft}px`;
    resizeTarget.style.top = `${newTop}px`;
}


function stopResize() {
    if (isResizing && resizeTarget) {
        // Re-enable CSS transitions
        resizeTarget.classList.remove('is-resizing');
    }

    // Reset resizing state variables
    isResizing = false;
    resizeTarget = null;
    resizeHandle = null;
    resizeType = null;

    // Remove document-level listeners
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('mouseleave', stopResize);

    // Restore global styles
    document.body.style.userSelect = '';
    document.body.style.cursor = ''; // Restore default body cursor
}

// --- Attaching Handlers ---

/**
 * Attaches drag listeners to the window header.
 * @param {HTMLElement} headerElement - The window header element.
 */
export function attachDragHandler(headerElement) {
    if (headerElement) {
        headerElement.addEventListener('mousedown', startDrag);
    } else {
        console.warn("attachDragHandler called with invalid headerElement");
    }
}

/**
 * Attaches resize listeners to window resizer handles.
 * Accepts a single resizer element or a NodeList/Array of resizer elements.
 * @param {HTMLElement | NodeList | Array<HTMLElement>} resizerElements - The resizer handle(s).
 */
export function attachResizeHandler(resizerElements) {
    if (resizerElements instanceof HTMLElement) {
        // Handle single element case
        console.log("Attaching resize listener to single element:", resizerElements);
        resizerElements.addEventListener('mousedown', startResize);
    } else if (resizerElements && typeof resizerElements.forEach === 'function') {
        // Handle NodeList or Array case
        console.log(`Attaching resize listeners to ${resizerElements.length} elements...`); // Add this log
        resizerElements.forEach((handle, index) => { // Add index for clarity
            if (handle instanceof HTMLElement) {
                console.log(`  Attaching to handle ${index}:`, handle); // Log each handle
                handle.addEventListener('mousedown', startResize);
            } else {
                 console.warn(`  Item at index ${index} is not an HTMLElement:`, handle);
            }
        });
    } else {
        console.warn("attachResizeHandler received invalid elements:", resizerElements);
    }
}