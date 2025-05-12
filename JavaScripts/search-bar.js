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

    // web serach
    const webSearch = document.createElement("button");
    webSearch.textContent = "Web Search";
    webSearch.style.marginLeft = "1em";
    webSearch.style.padding = "1em";
    webSearch.style.fontSize = "1.5em";
    webSearch.style.borderRadius = "0.5em";
    webSearch.style.border = "none";
    webSearch.style.outline = "none";
    webSearch.style.backgroundColor = "#fff";
    webSearch.style.transition = "width 0.5s ease-in-out, padding 0.5s ease-in-out";
    webSearch.addEventListener("click", () => {
        const query = searchInput.value;
        if (query) {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
        }
    });
    searchMenu.appendChild(webSearch);

    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>Í<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    

    
    
    
    

// Helyezd a <br> elemet az előző elem után
br = document.createElement("br");
searchMenu.appendChild(br);
searchMenu.appendChild(document.createElement("br"));

// Konténer sorba rendezett gombokhoz
const linkRow = document.createElement("div");
linkRow.style.display = "flex";
linkRow.style.gap = "8px";
linkRow.style.flexWrap = "wrap";
linkRow.style.marginTop = "8px";
linkRow.style.width = "100%";  // teljes szélesség

// A linkeket a searchMenu után jelenítjük meg, így biztosan új sorban vannak
searchMenu.insertAdjacentElement('afterend', linkRow);
searchMenu.appendChild(linkRow);

const list = [
  ["W3Schools",      "https://www.w3schools.com/"]/*,
  ["Stack Overflow", "https://stackoverflow.com/questions"],
  ["TutorialsPoint", "https://www.tutorialspoint.com/"],
  ["MDN Web Docs",   "https://developer.mozilla.org/en-US/"],
  ["GeeksforGeeks",  "https://www.geeksforgeeks.org/"],
  ["FreeCodeCamp",   "https://www.freecodecamp.org/"],
  ["Codecademy",     "https://www.codecademy.com/"],
  ["Coursera",       "https://www.coursera.org/"],
  ["Udemy",          "https://www.udemy.com/"],
  ["Khan Academy",   "https://www.khanacademy.org/"],
  ["edX",            "https://www.edx.org/"],*/
];

list.forEach(([label, url]) => {
  const link = document.createElement("a");
  link.textContent = label;
  link.href = url;
  link.target = "_blank";

  // Gomb kinézet
  link.style.display = "inline-block";
  link.style.padding = "4px 8px";
  link.style.fontSize = "0.85em";
  link.style.background = "rgba(255,255,255,0.15)";
  link.style.color = "#fff";
  link.style.borderRadius = "4px";
  link.style.textDecoration = "none";
  link.style.transition = "background 0.2s";

  // Hover effekt
  link.addEventListener("mouseenter", () => {
    link.style.background = "rgba(255,255,255,0.3)";
  });
  link.addEventListener("mouseleave", () => {
    link.style.background = "rgba(255,255,255,0.15)";
  });

  linkRow.appendChild(link);
});


    
    
    
    
    
    
    
    
    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>Í<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<


    document.body.appendChild(searchMenu);

    // Ez az eseményfigyelő zárja be a menüt, ha az input mezőn kívülre kattintanak
    searchMenu.addEventListener("click", (e) => {
        if(e.target !== searchInput ) { // && e.target !== webSearch
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
