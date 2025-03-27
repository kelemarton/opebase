// Manages taskbar items and their interactions

// Import actions - ADD closeWindow HERE
import { focusWindow, minimizeWindow, closeWindow } from './manage.js';

let taskbarCenterElement = null;
let draggedTaskbarItem = null;

/**
 * Initializes the taskbar module.
 * @param {HTMLElement} taskbarCenterContainer - The #taskbar-center element.
 */
export function initTaskbar(taskbarCenterContainer) {
    // ... (initTaskbar code remains the same) ...
    taskbarCenterElement = taskbarCenterContainer;
    taskbarCenterElement.addEventListener('dragover', handleTaskbarDragOver);
    taskbarCenterElement.addEventListener('drop', handleTaskbarDrop);
    taskbarCenterElement.addEventListener('dragleave', handleTaskbarDragLeave);
}

/**
 * Creates a taskbar item for a window.
 * @param {string} id - The window ID.
 * @param {string} title - The window title.
 * @returns {HTMLElement} The created taskbar item element.
 */
export function createTaskbarItem(id, title) {
    const taskbarItem = document.createElement('div');
    taskbarItem.classList.add('taskbar-item', 'buttonAni');
    // --- Adjust styles for button ---
    taskbarItem.style.maxWidth = '200px';
    // taskbarItem.textContent = title; // Remove this line, use a span instead
    taskbarItem.style.padding = '0 25px 0 15px'; // Add more padding on the right
    taskbarItem.style.width = 'auto';
    taskbarItem.style.justifyContent = 'flex-start';
    taskbarItem.style.position = 'relative'; // Needed for absolute positioning of the close button
    // --------------------------------

    taskbarItem.dataset.windowId = id;
    taskbarItem.title = title;
    taskbarItem.draggable = true;

    // --- Add a span for the title text ---
    const titleSpan = document.createElement('span');
    titleSpan.textContent = title;
    titleSpan.style.overflow = 'hidden';
    titleSpan.style.whiteSpace = 'nowrap';
    titleSpan.style.textOverflow = 'ellipsis';
    taskbarItem.appendChild(titleSpan);
    // --------------------------------------

    // --- Create and Append Close Button ---
    const closeBtn = document.createElement('div');
    closeBtn.classList.add('taskbar-item-close');
    closeBtn.innerHTML = '×'; // Simple 'X' symbol
    closeBtn.title = 'Close Window';
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering focusWindow on the parent item
        closeWindow(id);     // Call the imported closeWindow function
    });
    taskbarItem.appendChild(closeBtn);
    // --------------------------------------

    // Drag/Drop Listeners (for reordering)
    taskbarItem.addEventListener('dragstart', handleTaskbarDragStart);
    taskbarItem.addEventListener('dragend', handleTaskbarDragEnd);

    // Click/DoubleClick Listeners (for window actions on the main item)
    taskbarItem.addEventListener('click', () => {
        // Delegate to windowManager for focusing
        focusWindow(id); // Pass ID, windowManager will find the element
    });
    taskbarItem.addEventListener('dblclick', (e) => {
        e.preventDefault();
        // Delegate to windowManager for minimizing (it checks active state)
        minimizeWindow(id); // Pass ID, windowManager will find element & check state
    });

    taskbarCenterElement.appendChild(taskbarItem);
    return taskbarItem;
}

// --- Taskbar Drag and Drop Reordering Logic ---

function handleTaskbarDragStart(e) {
    draggedTaskbarItem = e.currentTarget;
    if (!draggedTaskbarItem || !draggedTaskbarItem.classList.contains('taskbar-item')) return;
    const windowId = draggedTaskbarItem.dataset.windowId;
    e.dataTransfer.setData('text/plain', windowId); e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { if (draggedTaskbarItem) draggedTaskbarItem.classList.add('dragging'); }, 0);
}

function handleTaskbarDragEnd() {
    if (draggedTaskbarItem) { draggedTaskbarItem.classList.remove('dragging'); }
    taskbarCenterElement.querySelectorAll('.taskbar-item.drag-over').forEach(item => item.classList.remove('drag-over'));
    draggedTaskbarItem = null;
}

function handleTaskbarDragOver(e) {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    const targetItem = e.target.closest('.taskbar-item');
    taskbarCenterElement.querySelectorAll('.taskbar-item.drag-over').forEach(item => { if (item !== targetItem) item.classList.remove('drag-over'); });
    if (targetItem && targetItem !== draggedTaskbarItem) { targetItem.classList.add('drag-over'); }
}

function handleTaskbarDragLeave(e) {
    const relatedTarget = e.relatedTarget; const currentTarget = e.target.closest('.taskbar-item');
    if (currentTarget && (!relatedTarget || !currentTarget.contains(relatedTarget))) { currentTarget.classList.remove('drag-over'); }
}

function handleTaskbarDrop(e) {
    e.preventDefault(); if (!draggedTaskbarItem) return;
    const targetItem = e.target.closest('.taskbar-item');
    if (targetItem && targetItem !== draggedTaskbarItem) { taskbarCenterElement.insertBefore(draggedTaskbarItem, targetItem); }
    else if (!targetItem && e.target === taskbarCenterElement) { taskbarCenterElement.appendChild(draggedTaskbarItem); }
    if (targetItem) { targetItem.classList.remove('drag-over'); }
    // Dragend handles cleanup
}