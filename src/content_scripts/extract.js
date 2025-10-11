//
// ***********************************************************************************
//                      CONSTANTS AND FUNCTIONS 
//
// ***********************************************************************************
//

const IEEE_URL_BASE = "https://ieeexplore.ieee.org/document/";

// Functions in this section taken from Obsidian Scholar plugin:
// https://github.com/lolipopshock/obsidian-scholar
// This is to ensure the output matches exactly the data formats the plugin works with.

function trimString(str) {
	if (str == null) return "";

	return str.replace(/\s+/g, " ").trim();
}

//
// ***********************************************************************************
//                      MAIN FUNCTION
//
// ***********************************************************************************
//

(() => {
    /**
    * Check and set a global guard variable.
    * If this content script is injected into the same page again,
    * it will do nothing next time.
    */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;

    // The event handler called when the asynchronous loads reading the content
    //      depends on have completed. Returns true if the bibtex was successfully
    //      read, or false otherwise.
    function finishUp(paperData) {

        let bibtexInnerSource = document.querySelector("pre.text.ris-text");
        // Return if the inner source element does not exist. This means the
        //      finishUp function was caused as the old content unloaded.
        if (bibtexInnerSource == null) {
            console.log("Inner Source was null. Skipping finishUp call.");
            return false;
        }

        let bibtex = bibtexInnerSource.innerText;
        // Return if the inner text does not begin with "@". This means the
        //      finishUp function was caused by a different tab loading.
        if (bibtex[0] != "@") {
            console.log(`Source is not bibtex. Skipping finishUp call: \"${bibtex}\"`);

            // Repeating the observer one time appears to work for some reason. The first
            //      call to the finishUp function sometimes triggers on the first tab load
            //      but fails to trigger on the tab load after the click on the Bibtex
            //      tab. By clicking on the tab again, the observer will call this finishUp
            //      function a second time.
            var bibTexTab = document.querySelector("a.document-tab-link[title=\"BibTeX\"]");
            bibTexTab.click();
            return false;
        }

        paperData.bibtex = bibtex;

        console.log(paperData);

        return true;
    }

    // Parses paperData from the current page.
    async function parseData(url) {

        // Validate the URL format.
        if (url.toLowerCase().includes(IEEE_URL_BASE) == false) {
            console.log("Invalid url: " + url);
            throw new Error("Invalid url: " + url);
        }

        let title = document.querySelector("h1.document-title span")?.innerHTML;
        let abstract = document.querySelector("div.abstract-text h2 + div")?.innerHTML;
        let authorsSource = document.getElementsByClassName("author-card");

        // Trigger the authors accordion section before attempting to scrape author
        //      data. This is necessary because the content of the accordion tab is
        //      not rendered until after the accordion tab is opened.
        if (document.querySelector("div#authors") == undefined) {
            let authorAccordionButton = document.querySelector("button#authors");
            authorAccordionButton.click();
        }

        let authors = [];
        for (let i = 0; i < authorsSource.length; i++) {
            var authorName = authorsSource[i].querySelector("a span")?.innerHTML;
            
            // Only add the author name if it has not yet been added. For some reason
            //      all authors are duplicated without this.
            if (!authors.includes(authorName)) {
                authors.push(authorName);
            }
        }

        // Try to grab a publication date. If none exists, use the conference date.
        let dateSource = document.querySelector("div.doc-abstract-pubdate")?.innerHTML;
        if (dateSource == null) {
            dateSource = document.querySelector("div.doc-abstract-confdate")?.innerHTML;
        }

        let date = "undefined";
        if (dateSource != null) {
            date = dateSource.split("</strong>")[1];
            date = date.split("<xpl-help-link")[0];
        }

        if (title == undefined) title = "undefined";
        if (abstract == undefined) abstract = "undefined";

        // Open the cite this modal if it is not already open.
        let bibtexSource = document.querySelector("div.cite-this-container");
        if (bibtexSource == null) {
            var citeThisButton = document.querySelector("xpl-cite-this-modal button");
            citeThisButton.click();
            bibtexSource = document.querySelector("div.cite-this-container");
        }

        // Open the BibTex tab.
        var bibTexTab = document.querySelector("a.document-tab-link[title=\"BibTeX\"]");
        bibTexTab.click();

        // The bibtex content takes a moment to load. Without delaying the execution,
        //      the content will not yet exist by the time this code tries to read it.
        // This sets a mutation observer to watch for changes on the innerHTML of the
        //      bibtex source container.
        var observer = new MutationObserver(function(mutationsList, observer) {

            // Create the paper data object.
            var paperData = {
                title: trimString(title),
                authors: authors,
                url: trimString(url),
                publicationDate: trimString(date),
                abstract: trimString(abstract),
                bibtex: ""
            };
            // Call the finish up function.
            if (finishUp(paperData)) {
                // Stop the observer from listening once the function returns true.
                observer.disconnect();
            };
        });
        observer.observe(bibtexSource, { characterData: false, childList: true, attributes: false });
    }

    /**
     * Listen for messages from the background script.
     * Call "insertBeast()" or "removeExistingBeasts()".
     */
    browser.runtime.onMessage.addListener(async (message) => {
        if (message.command === "hello") {
            await parseData(message.url);
        }
        else {
            console.log("huh");
        }
    })
})();