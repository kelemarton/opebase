function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}  

function toggleSidebar() {
    const body = document.body;
    const sidebar = document.getElementById("sidebar");

    // Get the current grid template column width.
    let current = body.style.gridTemplateColumns;
    if (!current) {
        current = window.getComputedStyle(body).gridTemplateColumns;
    }
    const parts = current.split(" ");
    let currentWidth = parseFloat(parts[0]);

    // Determine target width: collapse if currently expanded, else expand to 250px.
    const targetWidth = currentWidth > 0 ? 0 : 250;
    const duration = 300; // animation duration in ms
    const startTime = performance.now();

    function animate(time) {
        const elapsed = time - startTime;
        let progress = Math.min(elapsed / duration, 1);
        progress = easeInOut(progress);
        const newWidth = currentWidth + (targetWidth - currentWidth) * progress;

        // Update both the grid's first column and the sidebar's width.
        body.style.gridTemplateColumns = newWidth + "px auto";
        sidebar.style.width = newWidth + "px";

        if (elapsed < duration) {
            requestAnimationFrame(animate);
        } else {
            // After animation completes, update localStorage.
            localStorage.setItem("sidebar-state", newWidth > 0 ? "open" : "closed");
        }
    }
    requestAnimationFrame(animate);
}
