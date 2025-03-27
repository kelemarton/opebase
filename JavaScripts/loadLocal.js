function loadLocal() {
    applySidebarState();
}

function applySidebarState() {
    const sidebarState = localStorage.getItem("sidebar-state") || "open";
    const body = document.body;
    const sidebar = document.getElementById("sidebar");
    
    if (sidebarState === "closed") {
        body.style.gridTemplateColumns = "0 auto";
        sidebar.style.width = "0px";
        const toggleBtn = document.getElementById("toggle-sidebar");
        toggleBtn.style.transform = "scaleX(-1)";
    } else {
        body.style.gridTemplateColumns = "250px auto";
        sidebar.style.width = "250px";
        const toggleBtn = document.getElementById("toggle-sidebar");
        toggleBtn.style.transform = "none";
    }
}