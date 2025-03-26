function modeSwitch() {
    if (window.location.href.includes("freestyle")) {
        window.location.href = "compact";
        localStorage.setItem("interfaceLast", "compact");
    } else {
        window.location.href = "freestyle";
        localStorage.setItem("interfaceLast", "freestyle");
    }
}