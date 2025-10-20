//
// ***********************************************************************************
//                      CONSTANTS AND FUNCTIONS 
//
// ***********************************************************************************
//

const URL_ICON_LIGHT_MODE = "../icons/dark_mode.svg";
const URL_ICON_DARK_MODE = "../icons/light_mode.svg";

//
// ***********************************************************************************
//                      LIGHT/DARK MODE TOGGLE
//
// ***********************************************************************************
//

document.getElementById("theme-toggle-btn")?.addEventListener("click", (e) => {

    getThemeAsync()
        .then ((theme) => {
            return theme == "light" ? "dark" : "light";
        })
        .then(updateTheme)
        .then((theme) => {
            browser.storage.sync.set({ theme: theme });
        })
        .catch(onError);
});

async function getThemeAsync() {

    // Get the current theme.
    return browser.storage.sync.get("theme")
                .then((themeSetting) => {
                    return themeSetting.theme == undefined ? "dark" : themeSetting.theme;
                 });
}

function updateTheme(theme) {

    // Swap the button icon.
    var icon = document.getElementById("theme-toggle-img");
    var source = theme == "light" ? URL_ICON_LIGHT_MODE : URL_ICON_DARK_MODE;
    icon.setAttribute("src", source);

    // Update the page bootstrap color mode.
    document.body.setAttribute("data-bs-theme", theme);

    return theme;
}

getThemeAsync()
    .then(updateTheme)
    .catch(onError);

//
// ***********************************************************************************
//                      ERROR HANDLING
//
// ***********************************************************************************
//

function onError(error) {
    console.error(error.message);
}