// Debug window spawn
document.addEventListener('keydown', function(event) {
    if (event.key.toLowerCase() === 'p') {
        windowCreate();
    }
});
// Random ID gen
function generateRandomId(length = 8) {
    return Math.random().toString(36).substr(2, length);
}

// Function to create a new debug window
function windowCreate() {
    // Find the container element with the id 'display'
    const display = document.getElementById('display');

    // Create a new div element for the window
    const newWindow = document.createElement('div');

    // Set a random id for the new window
    newWindow.id = 'window-' + generateRandomId();

    // Add the class 'window'
    newWindow.classList.add('window');

    // Append the new window to the display container
    display.appendChild(newWindow);


    makeDraggable(debugWindow);
}

function makeDraggable(windowEl) {
    const header = windowEl.querySelector('.window-header');
    let offsetX, offsetY;
    
    header.addEventListener('mousedown', mouseDownHandler);
    
    function mouseDownHandler(e) {
      // Get initial offset
        offsetX = e.clientX - windowEl.offsetLeft;
        offsetY = e.clientY - windowEl.offsetTop;
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    }
    
    function mouseMoveHandler(e) {
        const display = document.getElementById('display');
        const displayRect = display.getBoundingClientRect();
        const windowRect = windowEl.getBoundingClientRect();

        // Calculate new position while enforcing that the window stays within #display
        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;
        
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft + windowRect.width > displayRect.width) newLeft = displayRect.width - windowRect.width;
        if (newTop + windowRect.height > displayRect.height) newTop = displayRect.height - windowRect.height;
        
        windowEl.style.left = newLeft + 'px';
        windowEl.style.top = newTop + 'px';
    }
}