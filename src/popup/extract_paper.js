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
            });
        }

        function onError() {
            console.log("oops");
        }

        /**
         * Get the active tab,
         * then call "beastify()" or "reset()" as appropriate.
         */
        if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
            // Ignore when click is not on a button within <div id="popup-content">.
            return;
        }

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