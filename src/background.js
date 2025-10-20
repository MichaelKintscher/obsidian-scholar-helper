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
//                      ONBOARDING AND UPBOARDING
//
// ***********************************************************************************
//

browser.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
  //if (temporary) return; // skip during development
  switch (reason) {
    case "install":
        {
            const url = browser.runtime.getURL("../docs/welcome.html");
            await browser.tabs.create({ url });
            // or: await browser.windows.create({ url, type: "popup", height: 600, width: 600, });
            break;
        }
    case "update":
        {
            // Not currently supported.
            break;
        }
  }
});

//
// ***********************************************************************************
//                      OFFBOARDING
//
// ***********************************************************************************
//

// TODO - set up a page for offboarding.
//browser.runtime.setUninstallURL("");

//
// ***********************************************************************************
//                      CONTENT SCRIPT INJECTION
//
// ***********************************************************************************
//

async function injectScript(tabs) {
    // Inject the script.
    await browser.scripting.executeScript({
        target: {
            tabId: tabs[0].id
        },
        files: ["/content_scripts/extract.js"]
    });
    
    return tabs;
}

//
// ***********************************************************************************
//                      EVENT WIRING
//
// ***********************************************************************************
//

function wireEvents() {

    // Wire the command (keyboard shortcut).
    browser.commands.onCommand.addListener((command) => {

        // Ensure the command is the correct one.
        if (command === "send-to-obsidian") {  
            main();
        }
    });

    // Wire the incoming message (sent from popup).
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {

        // Only respond to the correct message.
        if (request.message == "send-to-obsidian") {
            main();
        }
    })
}
wireEvents();

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
        .then(injectScript)
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

            // Inject the script.
            browser.scripting.executeScript({
                target: {
                    tabId: tabs[0].id
                },
                files: ["/content_scripts/extract.js"]
            });

            return site;
        })
        .then(sendToObsidian)
        .catch(onError);
}

//
// ***********************************************************************************
//                      CONTENT SCRIPT MESSAGING
//
// ***********************************************************************************
//

function sendToObsidian(site) {
    console.log("site: " + site);
    // Run the event handler.
    function messageContentScript(tabs) {
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

    /**
     * Get the active tab,
     * then call the click function as appropriate.
     */
    browser.tabs
        .query({ active: true, currentWindow: true })
        .then(messageContentScript)
        .catch(onError);
}

//
// ***********************************************************************************
//                      ERROR HANDLING
//
// ***********************************************************************************
//

function onError(error) {

    // Log the error and then bubble up.
    console.error(error.message);
    throw new Error(error.message);
}