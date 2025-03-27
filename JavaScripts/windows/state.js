// Manages shared state for the windowing system

// Store window data { id: { element, taskbarItem, isMinimized, isMaximized, originalRect } }
export const windows = {};

// Track the highest z-index
let zIndexCounter = 10;
export function getHighestZIndex() {
    return zIndexCounter;
}
export function incrementZIndex() {
    zIndexCounter++;
    return zIndexCounter;
}

// Note: activeWindow state will be managed within windowManager.js
// to avoid potential circular dependencies if other modules needed to set it.