/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function main() {
    // Wire the click event for the button.
    document.addEventListener("click", (e) => {
        // Run the event handler.
        console.log("hello world");

        function onClick(tabs) {
            browser.tabs.sendMessage(tabs[0].id, {
                command: "hello",
                url: tabs[0].url
            })
            .then((response) => {
                // Encode the properties on the paper data to make it url safe.
                let paperData = response.response;
                Object.keys(paperData).forEach((key) => {
                    paperData[key] = encodeURIComponent(paperData[key]);
                });
                // Open the Obsidian app with the paper data encoded into the url.
                // response.response.url = encodeURIComponent(response.response.url);
                // response.response.bibtex = encodeURIComponent(response.response.bibtex);
                let url = encodeURI(`obsidian://scholar?paper=${JSON.stringify(paperData)}&source=Helper Extension`);
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
            .catch(onError);
    });

    console.log("hello world");
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function onExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute beastify content script: ${error.message}`);
}

console.log("um");

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
    .executeScript({ file: "/content_scripts/extract.js" })
    .then(main)
    .catch(onExecuteScriptError);