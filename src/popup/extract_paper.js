//
// ***********************************************************************************
//                      CONSTANTS AND FUNCTIONS 
//
// ***********************************************************************************
//

const IEEE_URL_BASE = "https://ieeexplore.ieee.org/";
const ACM_URL_BASE = "https://dl.acm.org/";

const ERROR_INVALID_URL = "This site is not supported. Only IEEEXplore and ACM Digital Library are currently supported.";

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
    .executeScript({ file: "/content_scripts/extract.js" })
    .then(main)
    .catch(onExecuteScriptError);