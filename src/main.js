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