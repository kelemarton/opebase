function openSearch() {
    const searchMenu = document.createElement("div");
    searchMenu.id = "searchMenuID";
    searchMenu.tabIndex = -1; // Keep tabIndex for accessibility if needed

    const searchInput = document.createElement("input");
    searchInput.id = "search-input";
    searchInput.type = "search";
    searchInput.placeholder = "Search...";

    const webSearch = document.createElement("button");
    webSearch.id = "web-search-button"; // Assign ID for CSS
    webSearch.textContent = "Web Search";
    webSearch.addEventListener("click", () => {
        const query = searchInput.value;
        if (query.includes("https://") || query.includes("http://")) {
            window.open(query, "_blank");
        } else if ( query === "") {
            // The animation remains in JS as it's event-driven and dynamic
            searchMenu.animate([
                { backgroundColor: "rgba(255, 0, 0, 0.19)" },
                { backgroundColor: "rgba(0, 0, 0, 0.5)" }, // Original background from CSS
                { backgroundColor: "rgba(255, 0, 0, 0.19)" },
                { backgroundColor: "rgba(0, 0, 0, 0.5)" }  // Original background from CSS
            ], {
                duration: 1000,
                iterations: 1
            });
        } else {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
        }
    });

    const searchRow = document.createElement("div");
    searchRow.id = "search-row"; // Assign ID for CSS

    searchRow.appendChild(searchInput);
    searchRow.appendChild(webSearch);
    searchMenu.appendChild(searchRow);

    const linkRow = document.createElement("div");
    linkRow.id = "link-row"; // Assign ID for CSS

    searchMenu.appendChild(linkRow);

    const list = [
        ["W3Schools", "https://www.w3schools.com/"],
        ["MDN Web Docs", "https://developer.mozilla.org/"],
        ["Stack Overflow", "https://stackoverflow.com/"],
        ["CSS Tricks", "https://css-tricks.com/"],
        ["FreeCodeCamp", "https://www.freecodecamp.org/"],
        ["JavaScript Info", "https://javascript.info/"],
        ["Web.dev", "https://web.dev/"],
        ["Can I Use", "https://caniuse.com/"],
        ["DevDocs", "https://devdocs.io/"],
        ["CSS Reference", "https://cssreference.io/"],
        ["Frontend Mentor", "https://www.frontendmentor.io/"],
        ["CodePen", "https://codepen.io/"]
    ];

    list.forEach(([label, url]) => {
        const link = document.createElement("a");
        link.classList.add("quick-link"); // Assign class for CSS
        link.textContent = label;
        link.href = url;
        link.target = "_blank";
        // Hover effect is now handled by CSS :hover pseudo-class
        linkRow.appendChild(link);
    });

    document.body.appendChild(searchMenu);

    searchMenu.addEventListener("click", (e) => {
        if (e.target === searchMenu) {
            closeSearch();
        }
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeSearch();
        }
    });

    searchInput.focus();
}

function closeSearch() {
    const searchMenu = document.getElementById("searchMenuID");
    if (searchMenu) {
        searchMenu.remove();
    }
}