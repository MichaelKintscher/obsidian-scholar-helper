//
// ***********************************************************************************
//                      CONSTANTS AND FUNCTIONS 
//
// ***********************************************************************************
//

const IEEE_URL_BASE = "https://ieeexplore.ieee.org/";
const ACM_URL_BASE = "https://dl.acm.org/";

const ERROR_INVALID_URL = "This site is not supported. Only IEEEXplore and ACM Digital Library are currently supported.";

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

    var site = "";

    browser.tabs.query({ active: true, currentWindow: true })
        .then((tabs) => {

            // Validate the URL is a supported site.
            if (tabs[0].url.toLowerCase().includes(IEEE_URL_BASE)) {

                // The URL is from IEEEXplore.
                site = "IEEE";

            } else if (tabs[0].url.toLowerCase().includes(ACM_URL_BASE)) {

                // The URL is from ACM Digital Library.
                site = "ACM";

            } else {

                // The URL is not from a supported site.
                throw new Error(ERROR_INVALID_URL);
            }
        })
        .catch(onExecuteScriptError);

    // Wire the click event for the button.
    document.addEventListener("click", (e) => {
        // Run the event handler.
        function onClick(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: site,
                url: tabs[0].url
            })
            .then((response) => {
                // Encode the properties on the paper data to make it url safe.
                let paperData = response.response;
                Object.keys(paperData).forEach((key) => {
                    paperData[key] = encodeURIComponent(paperData[key]);
                });
                // Open the Obsidian app with the paper data encoded into the url.
                let url = encodeURI(`obsidian://scholar?command=createPaper&paper=${JSON.stringify(paperData)}&source=Helper Extension`);
                browser.tabs.create({ url: url });
            });
        }

        function onError() {
            console.log("oops");
        }

        
        if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
            // Ignore when click is not on a button within <div id="popup-content">.
            return;
        }

        /**
         * Get the active tab,
         * then call the click function as appropriate.
         */
        browser.tabs
            .query({ active: true, currentWindow: true })
            .then(onClick)
            .catch(onExecuteScriptError);
    });
}

//
// ***********************************************************************************
//                      CONTENT SCRIPT INJECTION
//
// ***********************************************************************************
//

function injectScript(tabs) {
    // Inject the script.
    browser.scripting.executeScript({
        target: {
            tabId: tabs[0].id
        },
        files: ["/content_scripts/extract.js"]
    });
    
    return;
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

//
// ***********************************************************************************
//                      SCRIPT ENTRY
//
// ***********************************************************************************
//

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
    .query({ active: true, currentWindow: true })
    .then(injectScript)
    .then(main)
    .catch(onExecuteScriptError);