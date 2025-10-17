//
// ***********************************************************************************
//                      CONSTANTS AND FUNCTIONS 
//
// ***********************************************************************************
//

// Functions in this section taken from Obsidian Scholar plugin:
// https://github.com/lolipopshock/obsidian-scholar
// This is to ensure the output matches exactly the data formats the plugin works with.

function trimString(str) {
	if (str == null) return "";

	return str.replace(/\s+/g, " ").trim();
}

function getCiteKeyFromBibtex(bibtex) {
	const match = bibtex.match(/@.*\{([^,]+)/);
	return match ? match[1] : null;
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
    //      depends on have completed. Returns the paper data if the bibtex was
    //      successfully read, or null otherwise.
    function finishUpIEEE(paperData) {

        let bibtexInnerSource = document.querySelector("pre.text.ris-text");
        // Return if the inner source element does not exist. This means the
        //      finishUp function was caused as the old content unloaded.
        if (bibtexInnerSource == null) {
            console.log("Inner Source was null. Skipping finishUp call.");
            return null;
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
            return null;
        }

        paperData.bibtex = bibtex;
        paperData.citekey = getCiteKeyFromBibtex(bibtex);
        //console.log(paperData);

        return paperData;
    }

    async function parseDataIEEE(url, finishedFunc) {

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

        let venueSource = document.querySelector("div.stats-document-abstract-publishedIn");
        let venue = venueSource.innerText.replace("Published in: ","");

        // Try to grab a publication date. If none exists, use the conference date.
        let dateSource = document.querySelector("div.doc-abstract-pubdate")?.innerHTML;
        if (dateSource == null) {
            dateSource = document.querySelector("div.doc-abstract-confdate")?.innerHTML;
        }

        let date = "undefined";
        if (dateSource != null) {
            date = dateSource.split("</strong>")[1];
            date = date.split("<xpl-help-link")[0];
            date = date.trim();

            // If the days are a range (includes a dash before the first space)...
            if (date.split(" ")[0].includes("-")) {

                // Remove the end date (substring beginning with the dash and ending before the space).
                var endDateString = date.substring(date.indexOf("-"), date.indexOf(" "));
                console.log(endDateString);
                date = date.replace(endDateString, "");
            }
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
                venue: trimString(venue),
                publicationDate: trimString(date),
                abstract: trimString(abstract),
                bibtex: ""
            };
            // Call the finish up function.
            var result = finishUpIEEE(paperData);
            if (result != null) {
                // Stop the observer from listening once the function returns true.
                observer.disconnect();
                console.log(result);
                // Resolve the promise by calling the resolve function.
                finishedFunc({ response: result });
            };
        });
        observer.observe(bibtexSource, { characterData: false, childList: true, attributes: false });
        bibTexTab.click();
    }

    // The event handler called when the asynchronous loads reading the content
    //      depends on have completed. Returns the paper data if the bibtex was
    //      successfully read, or null otherwise.
    function finishUpACM(paperData) {

        let bibTexElement = document.querySelector("form input[name=\"content\"]");
        // Return if the inner source element does not exist. This means the
        //      finishUp function was caused as the old content unloaded.
        if (bibTexElement.value[0] != "@") {
            console.log("Value was not bibtex format. Skipping finishUp call.");
            return null;
        }

        let bibtex = bibTexElement.value;

        paperData.bibtex = bibtex;
        paperData.citekey = getCiteKeyFromBibtex(bibtex);
        //console.log(paperData);

        return paperData;
    }

    async function parseDataACM(url, finishedFunc) {
        
        let title = document.querySelector("h1[property=\"name\"]")?.innerText;
        let abstract = document.querySelector("section#abstract div[role=\"paragraph\"]")?.innerText;
        let authorsSource = document.querySelectorAll("div.contributors span[property=\"author\"] a");
        let authors = Array.from(authorsSource)
            .map((a) => a.getAttribute("title"))
            .filter(element => element); // Remove extra null values.

        // Remove any query parameters from the URL.
        const urlObj = new URL(url);
        url = urlObj.origin + urlObj.pathname;

        let venue = document.querySelector("div.core-self-citation div[property=\"isPartOf\"]")?.innerText;
        let date = document.querySelector(".core-date-published")?.innerText;

        // The export citation modal already exists, but is just hidden.
        let citationFormatSelect = document.querySelector("select#citation-format");
        citationFormatSelect.value = "bibtex";

        // The default value of the export citation modal is also bibtex, so the hiddent element
        //      already contains a value with the bibtex.
        let bibTexElement = document.querySelector("form input[name=\"content\"]");
        console.log(bibTexElement);

        // If the bibtex value is not already loaded, trigger and wait for the bibtex to load.
        if (bibTexElement.value == "") {

            let citeButton = document.querySelector("button[title=\"Export Citation\"]");

            // The bibtex content takes a moment to load. Without delaying the execution,
            //      the content will not yet exist by the time this code tries to read it.
            // This sets a mutation observer to watch for changes on the attribute of the
            //      bibtex element.
            var observer = new MutationObserver(function(mutationsList, observer) {

                // Create the paper data object.
                var paperData = {
                    title: trimString(title),
                    authors: authors,
                    url: trimString(url),
                    venue: trimString(venue),
                    publicationDate: trimString(date),
                    abstract: trimString(abstract),
                    bibtex: ""
                };
                // Call the finish up function.
                var result = finishUpACM(paperData);
                if (result != null) {
                    // Stop the observer from listening once the function returns true.
                    observer.disconnect();
                    console.log(result);
                    // Resolve the promise by calling the resolve function.
                    finishedFunc({ response: result });
                };
            });
            observer.observe(bibTexElement, { characterData: false, childList: false, attributes: true });
            citeButton.click();
            return;
        }

        // The bibtex is already loaded, so simply read the value.
        let bibtex = bibTexElement.value;

        // Create the paper data object.
        var paperData = {
            title: trimString(title),
            authors: authors,
            url: trimString(url),
            venue: trimString(venue),
            publicationDate: trimString(date),
            abstract: trimString(abstract),
            bibtex: bibtex,
            citekey: getCiteKeyFromBibtex(bibtex)
        };
        console.log(paperData);
        finishedFunc({ response: paperData, status: "ok" });
    }

    /**
     * Listen for messages from the background script.
     * Call the parse data function.
     */
    browser.runtime.onMessage.addListener((message) => {
        if (message.command === "IEEE") {
            return new Promise((finished, rejected) => {
                
                parseDataIEEE(message.url, finished);
            });
        } else if (message.command === "ACM") {

            return new Promise((finished, rejected) => {
                
                parseDataACM(message.url, finished);
            });
        }
        else {
            console.error("Invalid command received from browser extension.");
        }
    });
})();