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

    function parseData(url) {

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
        console.log(authorsSource);
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

        let bibtex = document.querySelector(".text.ris-text");
        console.log(bibtex);

        return {
            title: trimString(title),
            authors: authors,
            url: trimString(url),
            publicationDate: trimString(date),
            abstract: trimString(abstract),
            bibtex: bibtex
        };
    }

    /**
     * Listen for messages from the background script.
     * Call "insertBeast()" or "removeExistingBeasts()".
     */
    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "hello") {
            console.log(parseData(message.url));
        }
        else {
            console.log("huh");
        }
    })
})();