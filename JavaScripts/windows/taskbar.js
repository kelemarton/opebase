// Manages taskbar items and their interactions

import { focusWindow, minimizeWindow, closeWindow } from './manage.js'; // Import actions

let taskbarCenterElement = null;
let draggedTaskbarItem = null;

/**
 * Initializes the taskbar module.
 * @param {HTMLElement} taskbarCenterContainer - The #taskbar-center element.
 */
export function initTaskbar(taskbarCenterContainer) {
    taskbarCenterElement = taskbarCenterContainer;
    // Add container listeners for drag/drop reordering
    taskbarCenterElement.addEventListener('dragover', handleTaskbarDragOver);
    taskbarCenterElement.addEventListener('drop', handleTaskbarDrop);
    taskbarCenterElement.addEventListener('dragleave', handleTaskbarDragLeave); // Keep dragleave on container
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
    // --- Style adjustments ---
    taskbarItem.style.maxWidth = '200px';
    taskbarItem.style.padding = '0 30px 0 15px'; // Padding for text & close button space
    taskbarItem.style.width = 'auto';
    taskbarItem.style.justifyContent = 'flex-start';
    taskbarItem.style.position = 'relative'; // Needed for absolute positioning of the close button
    // --------------------------------

    taskbarItem.dataset.windowId = id;
    taskbarItem.title = title; // Tooltip for the whole item
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
    closeBtn.title = 'Close Window'; // Tooltip specific to the button
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
    // Prevent drag if clicking the close button itself
    if (e.target.classList.contains('taskbar-item-close')) {
         e.preventDefault(); // Stop the drag operation
         return;
    }

    draggedTaskbarItem = e.currentTarget; // The taskbar-item div
    if (!draggedTaskbarItem || !draggedTaskbarItem.classList.contains('taskbar-item')) {
        draggedTaskbarItem = null;
        return;
    }

    const windowId = draggedTaskbarItem.dataset.windowId;
    e.dataTransfer.setData('text/plain', windowId);
    e.dataTransfer.effectAllowed = 'move';

    // Use setTimeout to allow the browser to render the drag image before adding the class
    setTimeout(() => {
        if (draggedTaskbarItem) { // Check if it wasn't reset
             draggedTaskbarItem.classList.add('dragging');
        }
    }, 0);
}

function handleTaskbarDragEnd() {
    // Cleanup the 'dragging' class from the item that was dragged
    if (draggedTaskbarItem) {
        draggedTaskbarItem.classList.remove('dragging');
    }

    // Cleanup any remaining visual indicators ('drag-over-before'/'drag-over-after')
    // Query within the specific container for safety
    if (taskbarCenterElement) {
        taskbarCenterElement.querySelectorAll('.taskbar-item.drag-over-before, .taskbar-item.drag-over-after')
            .forEach(item => {
                item.classList.remove('drag-over-before', 'drag-over-after');
            });
        // Optional: Remove container class if used
        // taskbarCenterElement.classList.remove('drop-target-area');
    }

    // Reset the global dragged item variable
    draggedTaskbarItem = null;
}

function handleTaskbarDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';

    // Find the potential target taskbar item
    const targetItem = e.target.closest('.taskbar-item');
    const currentTargetContainer = e.target.closest('#taskbar-center');

    // Clear previous indicators ONLY on items that are NOT the current target
    if (taskbarCenterElement) {
         taskbarCenterElement.querySelectorAll('.taskbar-item.drag-over-before, .taskbar-item.drag-over-after')
            .forEach(item => {
                if (item !== targetItem) {
                    item.classList.remove('drag-over-before', 'drag-over-after');
                }
            });
        // Optional: Remove container class if used
        // if (e.target !== taskbarCenterElement) taskbarCenterElement.classList.remove('drop-target-area');
    }


    if (targetItem && targetItem !== draggedTaskbarItem) {
        const targetRect = targetItem.getBoundingClientRect();
        // Calculate the horizontal midpoint of the target item
        const midpoint = targetRect.left + targetRect.width / 2;

        // Clean existing classes on the target before adding the new one
        targetItem.classList.remove('drag-over-before', 'drag-over-after');

        // Add the appropriate class based on cursor position relative to the midpoint
        if (e.clientX < midpoint) {
            targetItem.classList.add('drag-over-before'); // Indicate drop before
        } else {
            targetItem.classList.add('drag-over-after');  // Indicate drop after
        }
        // Optional: Remove container class if hovering over an item
        // if (taskbarCenterElement) taskbarCenterElement.classList.remove('drop-target-area');

    } else if (!targetItem && currentTargetContainer) {
         // Optional: If hovering over the container background (not an item), indicate dropping at the end
        // Maybe add a class to the container or the last item?
        // if (taskbarCenterElement) taskbarCenterElement.classList.add('drop-target-area'); // Needs CSS
         // Ensure no item indicators are active when hovering the container background
          if (taskbarCenterElement) {
            taskbarCenterElement.querySelectorAll('.taskbar-item.drag-over-before, .taskbar-item.drag-over-after')
                .forEach(item => item.classList.remove('drag-over-before', 'drag-over-after'));
        }
    }
}

function handleTaskbarDragLeave(e) {
    // This event fires when the mouse leaves the element it was *over*
    const leavingElement = e.target;
    const enteringElement = e.relatedTarget; // Element mouse is going to

    // If leaving a taskbar item or its child
    const leavingItem = leavingElement.closest('.taskbar-item');
    if (leavingItem) {
        // Check if the mouse is moving to something *outside* this specific item
        // (Could be another item, the container, or outside the container entirely)
        const enteringItem = enteringElement ? enteringElement.closest('.taskbar-item') : null;

        if (!enteringElement || // Mouse left the window/container entirely
            enteringItem !== leavingItem) // Mouse entered a different item or not an item at all
        {
            leavingItem.classList.remove('drag-over-before', 'drag-over-after');
        }
    }

    // Optional: If leaving the container itself
    // if (leavingElement === taskbarCenterElement && (!enteringElement || !taskbarCenterElement.contains(enteringElement))) {
    //      taskbarCenterElement.classList.remove('drop-target-area');
    // }
}

function handleTaskbarDrop(e) {
    e.preventDefault(); // Prevent default drop behavior (like opening link)
    if (!draggedTaskbarItem) return; // Only handle drops if we are dragging a known item

    const targetItem = e.target.closest('.taskbar-item'); // Find the item being dropped onto

    // Determine where to insert the dragged item
    if (targetItem && targetItem !== draggedTaskbarItem) {
        // Dropped onto another item
        const targetRect = targetItem.getBoundingClientRect();
        const midpoint = targetRect.left + targetRect.width / 2;

        if (e.clientX < midpoint) {
            // Drop on first half: Insert BEFORE targetItem
            taskbarCenterElement.insertBefore(draggedTaskbarItem, targetItem);
        } else {
            // Drop on second half: Insert AFTER targetItem (i.e., before target's next sibling)
            // insertBefore handles null referenceNode (last item) correctly by appending
            taskbarCenterElement.insertBefore(draggedTaskbarItem, targetItem.nextSibling);
        }
    } else if (!targetItem && e.target.closest('#taskbar-center')) {
        // Dropped directly onto the taskbar container background (not on an item)
        taskbarCenterElement.appendChild(draggedTaskbarItem); // Append to the end
    }
    // If dropped on itself or outside the designated drop zones, do nothing.

    // Visual cleanup is handled by the 'dragend' event, which fires after 'drop'
}