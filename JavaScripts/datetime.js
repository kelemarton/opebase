// Function to update both the time and date indicators
function updateDateTime() {
    const now = new Date();

    // Format the time and date strings
    const timeStr = now.toLocaleTimeString();
    const dateStr = now.toLocaleDateString();

    // Get the elements by their IDs and update their content
    const timeEl = document.getElementById("timeIndicator");
    const dateEl = document.getElementById("dateIndicator");

    if (timeEl) {
        timeEl.innerText = timeStr;
    }
    if (dateEl) {
        dateEl.innerText = dateStr;
    }
}

// Update every second (1000 milliseconds)
setInterval(updateDateTime, 1000);

// Run immediately once the page loads
window.onload = updateDateTime;