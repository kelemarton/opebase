function openSearch() {
    const searchMenu = document.createElement("div");
    searchMenu.id = "searchMenuID";
    searchMenu.tabIndex = -1;
    Object.assign(searchMenu.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "1000",
        transition: "opacity 0.5s ease-in-out, pointer-events 0.5s ease-in-out"
    });

    const searchInput = document.createElement("input");
    searchInput.id = "search-input";
    searchInput.type = "search";
    searchInput.placeholder = "Search...";
    Object.assign(searchInput.style, {
        width: "100%",
        maxWidth: "30em",
        padding: "0.5em",
        fontSize: "1.5em",
        borderRadius: "0.5em",
        border: "none",
        outline: "none",
        backgroundColor: "#fff",
        transition: "width 0.5s ease-in-out, padding 0.5s ease-in-out",
        flex: "1 1 auto"
    });

    const webSearch = document.createElement("button");
    webSearch.textContent = "Web Search";
    Object.assign(webSearch.style, {
        padding: "0.5em 1em",
        fontSize: "1.2em",
        borderRadius: "0.5em",
        border: "none",
        outline: "none",
        backgroundColor: "#fff",
        transition: "background 0.3s ease",
        cursor: "pointer",
        whiteSpace: "nowrap"
    });
    webSearch.addEventListener("click", () => {
        const query = searchInput.value;
        if (query.includes("https://") || query.includes("http://")) {
            window.open(query, "_blank");
        }else if ( query === "") {
            searchMenu.animate([
            { backgroundColor: "rgba(255, 0, 0, 0.19)" },
            { backgroundColor: "rgba(0, 0, 0, 0.5)" },
            { backgroundColor: "rgba(255, 0, 0, 0.19)" },
            { backgroundColor: "rgba(0, 0, 0, 0.5)" }
            ], {
                duration: 1000,
                iterations: 1
            });
        } else {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
        }
    });

    const searchRow = document.createElement("div");
    Object.assign(searchRow.style, {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px",
        width: "90%",
        maxWidth: "40em",
        flexWrap: "nowrap"
    });

    searchRow.appendChild(searchInput);
    searchRow.appendChild(webSearch);
    searchMenu.appendChild(searchRow);

    const linkRow = document.createElement("div");
    Object.assign(linkRow.style, {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        marginTop: "8px",
        width: "90%",
        maxWidth: "40em",
        justifyContent: "center"
    });

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
        link.textContent = label;
        link.href = url;
        link.target = "_blank";
        Object.assign(link.style, {
            display: "inline-block",
            padding: "4px 8px",
            fontSize: "0.85em",
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            borderRadius: "4px",
            textDecoration: "none",
            transition: "background 0.2s"
        });
        link.addEventListener("mouseenter", () => {
            link.style.background = "rgba(255,255,255,0.3)";
        });
        link.addEventListener("mouseleave", () => {
            link.style.background = "rgba(255,255,255,0.15)";
        });
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
