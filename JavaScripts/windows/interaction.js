// Handles window dragging and resizing logic

import { focusWindow } from './manage.js'; // Import function to handle focus
import { windows } from './state.js'; // Access state if needed (e.g., check isMaximized)

let isDragging = false;
let dragTarget = null;
let dragOffsetX, dragOffsetY;
let dragDisplayRectCache = null; // Renamed to avoid conflict

let isResizing = false;
let resizeTarget = null;
let resizeStartX, resizeStartY;
let resizeInitialWidth, resizeInitialHeight;
let resizeInitialLeft, resizeInitialTop;

let displayElement = null; // To cache the display element

/**
 * Initializes the interaction module with the display container.
 * @param {HTMLElement} displayContainer - The main display area element.
 */
export function initInteraction(displayContainer) {
    displayElement = displayContainer;
}

// --- Dragging Logic ---

function startDrag(e) {
    if (e.button !== 0 || !displayElement) return;
    const target = e.target.closest('.window');
    // Prevent drag if maximized or animating
    if (!target || windows[target.dataset.windowId]?.isMaximized || target.classList.contains('closing') || target.classList.contains('minimizing')) {
        dragTarget = null; return;
    }

    dragTarget = target;
    focusWindow(dragTarget); // Call imported focus function
    isDragging = true;
    dragDisplayRectCache = displayElement.getBoundingClientRect();
    const targetRect = dragTarget.getBoundingClientRect();
    dragOffsetX = e.clientX - targetRect.left;
    dragOffsetY = e.clientY - targetRect.top;

    dragTarget.classList.add('is-dragging'); // Disable transitions

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('mouseleave', stopDrag);
    dragTarget.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
}

function doDrag(e) {
    if (!isDragging || !dragTarget || !dragDisplayRectCache) return;
    const desiredViewportX = e.clientX - dragOffsetX;
    const desiredViewportY = e.clientY - dragOffsetY;
    let newLeft = desiredViewportX - dragDisplayRectCache.left;
    let newTop = desiredViewportY - dragDisplayRectCache.top;
    const winWidth = dragTarget.offsetWidth;
    const winHeight = dragTarget.offsetHeight;
    const maxLeft = dragDisplayRectCache.width - winWidth;
    const maxTop = dragDisplayRectCache.height - winHeight;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));
    dragTarget.style.left = `${newLeft}px`;
    dragTarget.style.top = `${newTop}px`;
}

function stopDrag() {
    if (isDragging && dragTarget) {
        dragTarget.style.cursor = '';
        dragTarget.classList.remove('is-dragging'); // Re-enable transitions
    }
    isDragging = false;
    dragTarget = null;
    dragDisplayRectCache = null;
    document.removeEventListener('mousemove', doDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('mouseleave', stopDrag);
    document.body.style.userSelect = '';
}

// --- Resizing Logic ---

function startResize(e) {
    if (e.button !== 0 || !displayElement) return;
    const target = e.target.closest('.window');
    // Prevent resize if maximized or animating
    if (!target || windows[target.dataset.windowId]?.isMaximized || target.classList.contains('closing') || target.classList.contains('minimizing')) {
        resizeTarget = null; return;
    }

    resizeTarget = target;
    focusWindow(resizeTarget); // Call imported focus function
    isResizing = true;
    resizeStartX = e.clientX; resizeStartY = e.clientY;
    resizeInitialWidth = resizeTarget.offsetWidth; resizeInitialHeight = resizeTarget.offsetHeight;
    resizeInitialLeft = resizeTarget.offsetLeft; resizeInitialTop = resizeTarget.offsetTop;

    resizeTarget.classList.add('is-resizing'); // Disable transitions

    document.addEventListener('mousemove', doResize);
    document.addEventListener('mouseup', stopResize);
    document.addEventListener('mouseleave', stopResize);
    document.body.style.userSelect = 'none';
}

function doResize(e) {
    if (!isResizing || !resizeTarget) return;
    const deltaX = e.clientX - resizeStartX;
    const deltaY = e.clientY - resizeStartY;
    const displayRect = displayElement.getBoundingClientRect(); // Use current display bounds
    const computedStyle = getComputedStyle(resizeTarget);
    const minWidth = parseInt(computedStyle.minWidth) || 150;
    const minHeight = parseInt(computedStyle.minHeight) || 100;
    let newWidth = resizeInitialWidth + deltaX;
    let newHeight = resizeInitialHeight + deltaY;
    newWidth = Math.max(minWidth, newWidth);
    newHeight = Math.max(minHeight, newHeight);
    newWidth = Math.min(newWidth, displayRect.width - resizeInitialLeft);
    newHeight = Math.min(newHeight, displayRect.height - resizeInitialTop);
    resizeTarget.style.width = `${newWidth}px`;
    resizeTarget.style.height = `${newHeight}px`;
}

function stopResize() {
    if (isResizing && resizeTarget) {
        resizeTarget.classList.remove('is-resizing'); // Re-enable transitions
    }
    isResizing = false;
    resizeTarget = null;
    document.removeEventListener('mousemove', doResize);
    document.removeEventListener('mouseup', stopResize);
    document.removeEventListener('mouseleave', stopResize);
    document.body.style.userSelect = '';
}

/**
 * Attaches drag listeners to the window header.
 * @param {HTMLElement} headerElement - The window header element.
 */
export function attachDragHandler(headerElement) {
    headerElement.addEventListener('mousedown', startDrag);
}

/**
 * Attaches resize listeners to the window resizer handle.
 * @param {HTMLElement} resizerElement - The window resizer element.
 */
export function attachResizeHandler(resizerElement) {
    resizerElement.addEventListener('mousedown', startResize);
}