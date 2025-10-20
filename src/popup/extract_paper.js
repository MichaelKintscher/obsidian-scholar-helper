//
// ***********************************************************************************
//                      CONSTANTS AND FUNCTIONS 
//
// ***********************************************************************************
//

// const IEEE_URL_BASE = "https://ieeexplore.ieee.org/";
// const ACM_URL_BASE = "https://dl.acm.org/";

// const ERROR_INVALID_URL = "This site is not supported. Only IEEEXplore and ACM Digital Library are currently supported.";

const URL_ICON_LIGHT_MODE = "../icons/dark_mode.svg";
const URL_ICON_DARK_MODE = "../icons/light_mode.svg";
const URL_LOGO_LIGHT_MODE = "../icons/icon_48.svg";
const URL_LOGO_DARK_MODE = "../icons/icon_96.svg";

const HELP_LINK_BASE = "../docs/welcome.html";

//
// ***********************************************************************************
//                      MAIN FUNCTION
//
// ***********************************************************************************
//

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function main() {

    // Wire the click event for the button.
    document.addEventListener("click", (e) => {

        if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
            // Ignore when click is not on a button within <div id="popup-content">.
            return;
        }

        browser.runtime.sendMessage({ message: "send-to-obsidian" });
    });
}

//
// ***********************************************************************************
//                      ERROR HANDLING
//
// ***********************************************************************************
//

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function onExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    document.querySelector("#error-content").innerHTML = `<p>${error.message}</p>`
    console.error(`Failed to execute Obsidian Scholar Helper content script: ${error.message}`);
}

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
        .catch(onExecuteScriptError);
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

    // Update the logo icon.
    var logo = document.getElementById("logo-img");
    var logoSource = theme == "light" ? URL_LOGO_LIGHT_MODE : URL_LOGO_DARK_MODE;
    logo.setAttribute("src", logoSource);

    // Update the help query parameter.

    return theme;
}

getThemeAsync()
    .then(updateTheme)
    .catch(onExecuteScriptError);

main();