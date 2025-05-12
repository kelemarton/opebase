// Main entry point for the OpeBase windowing system

import { createWindow } from './manage.js';
import { initInteraction } from './interaction.js';
import { initTaskbar } from './taskbar.js';
import { initDebug } from './debug.js';

document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const taskbarCenter = document.getElementById('taskbar-center');
    const startMenu = document.getElementById('start-menu');

    if (!display || !taskbarCenter) {
        console.error("Fatal Error: #display or #taskbar-center not found. Window system cannot initialize.");
        return;
    }

    // Initialize modules that need DOM elements
    initInteraction(display);
    initTaskbar(taskbarCenter);
    initDebug(display); // Debug module needs display for positioning/bounds check via createWindow

    // Check for #display positioning (Warning)
    if (getComputedStyle(display).position !== 'relative') {
        console.warn('#display element should have "position: relative;" in CSS for accurate window positioning.');
    }

    // --- Example Usage: Start Menu Listener ---
    if (startMenu) {
        let windowCount = 0;
        startMenu.addEventListener('click', () => {
            windowCount++;
            const newId = `win_${Date.now()}`;
            // Call the main createWindow function, passing the display element
            createWindow(
                newId,
                `Window ${windowCount}`,
                `<h3>Content ${windowCount}</h3><p>Modularized window system!</p>`,
                display // Pass display element
            );
        });
    } else {
        console.log("Add id='start-menu' element for example window creation.");
    }

    // --- Expose Global API ---
    // Make createWindow available globally if needed by other non-module scripts
    window.OpeBase = window.OpeBase || {};
    // Wrap createWindow to automatically pass the display element
    window.OpeBase.createWindow = (id, title, content) => {
        return createWindow(id, title, content, display);
    };

    // --- Trigger loadLocal if it exists and needs the API ---
    if (typeof window.loadLocal === 'function') {
         console.log("Running loadLocal...");
         window.loadLocal(); // Assuming loadLocal might use OpeBase.createWindow
    }

});