function openSearch() {
    const searchMenu = document.createElement("div");
    searchMenu.id = "searchMenuID";
    searchMenu.tabIndex = -1;
    searchMenu.style.position = "fixed";
    searchMenu.style.top = "0";
    searchMenu.style.left = "0";
    searchMenu.style.width = "100%";
    searchMenu.style.height = "100%";
    searchMenu.style.backgroundColor = "rgba(0,0,0,0.5)";
    searchMenu.style.display = "flex";
    searchMenu.style.justifyContent = "center";
    searchMenu.style.alignItems = "center";
    searchMenu.style.zIndex = "1000";
    searchMenu.style.transition = "opacity 0.5s ease-in-out, pointer-events 0.5s ease-in-out";

    const searchInput = document.createElement("input");
    searchInput.id = "search-input";
    searchInput.type = "search";
    searchInput.placeholder = "Search...";
    searchInput.style.width = "50%";
    searchInput.style.padding = "1em";
    searchInput.style.fontSize = "1.5em";
    searchInput.style.borderRadius = "0.5em";
    searchInput.style.border = "none";
    searchInput.style.outline = "none";
    searchInput.style.backgroundColor = "#fff";
    searchInput.style.transition = "width 0.5s ease-in-out, padding 0.5s ease-in-out";

    searchMenu.appendChild(searchInput);
    document.body.appendChild(searchMenu);

    // Ez az eseményfigyelő zárja be a menüt, ha az input mezőn kívülre kattintanak
    searchMenu.addEventListener("click", (e) => {
        if(e.target !== searchInput) {
            closeSearch(); // Feltételezve, hogy létezik egy closeSearch függvény
        }
    });

    // Ez az eseményfigyelő zárja be a menüt, ha lenyomják az ESC gombot
    searchInput.addEventListener("keydown", (e) => {
        if(e.key === "Escape") {
            closeSearch(); // Feltételezve, hogy létezik egy closeSearch függvény
        }
    });

    searchInput.focus();
}

// Megjegyzés: A closeSearch függvényt neked kell implementálnod,
// ami eltávolítja a searchMenu elemet a DOM-ból.
// Például:

function closeSearch() {
    const searchMenu = document.getElementById("searchMenuID");
    if (searchMenu) {
        searchMenu.remove(); // Vagy searchMenu.parentElement.removeChild(searchMenu);
    }
}
