function openStartMenu() {
    const menuPoints = ["Start", "Settings"];
    const startMenuButton = document.getElementById("start-menu");
    const startMenuXCoord = startMenuButton ? startMenuButton.getBoundingClientRect().left : 0;

    const menuDivs = menuPoints.map((element, index) => {
        const div = document.createElement("div");
        div.id = element;
        div.style.position = "absolute";
        div.style.height = "50px";
        div.style.width = "100px";
        div.style.borderRadius = "60px";
        div.style.backgroundColor = "white";
        div.style.top = `calc(${startMenuButton ? startMenuButton.getBoundingClientRect().top + 10 : 0}px - ${75 + index * 60}px)`; // Adjusted to appear just above the start menu
        div.style.left = `${startMenuXCoord}px`;
        div.onclick = function() {
            window[element + "Click"]();
            menuDivs.forEach(div => div.remove());
        };

        const text = document.createElement("p");
        text.textContent = element;
        text.style.margin = "0px";
        text.style.padding = "10px";
        text.style.textAlign = "center";
        text.style.width = "100%";
        div.appendChild(text);

        document.body.appendChild(div);

        return div;
    });
}

document.addEventListener("click", (e) => {
    if(!e.target.closest("#start-menu") && !e.target.closest("#Start") && !e.target.closest("#Settings")) {
        closeMenu();
    }
});

function closeMenu() {
    const menuDivs = document.querySelectorAll("#Start, #Settings");
    menuDivs.forEach(div => div.remove());
}

function StartClick() {
    console.log("Start clicked.");
}

function SettingsClick() {
    console.log("Settings clicked.");
    
    const settingsWindow = document.createElement("div");
    settingsWindow.id = "settingsWindow";
    settingsWindow.style.position = "absolute";
    settingsWindow.style.top = "calc(50vh - 150px)";
    settingsWindow.style.left = "calc(50vw - 150px)";
    settingsWindow.style.width = "300px";
    settingsWindow.style.height = "300px";
    settingsWindow.style.backgroundColor = "#aaa";
    settingsWindow.style.borderRadius = "10px";
    //settingsWindow.style.padding = "10px";
    settingsWindow.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    document.body.appendChild(settingsWindow);

    const settingsTitle = document.createElement("p");
    settingsTitle.id = "settingsTitle";
    settingsTitle.style.margin = "5px";
    settingsTitle.textContent = "Settings";
    settingsTitle.style.textAlign = "center";
    settingsWindow.appendChild(settingsTitle);

    const hr = document.createElement("hr");
    hr.style.margin = "0 auto";
    hr.style.border = "1px solid #ccc";
    hr.style.borderRadius = "5px";
    settingsWindow.appendChild(hr);

    const settingsForm = document.createElement("form");
    settingsForm.id = "settingsForm";
    settingsWindow.appendChild(settingsForm);


    

}