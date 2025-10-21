# Obsidian Scholar Helper

A browser extension to help add papers to your Obsidian paper library to be managed with the Obsidian Scholar Plugin for Obsidian.

## Overview

This browser extension adds another way to send papers to your Obsidian Scholar paper library. The [Obsidian Scholar plugin](https://github.com/lolipopshock/obsidian-scholar) currently supports ArXiv and Semantic Scholar, both of which provide APIs that Obsidian Scholar uses to import papers.

**This extension requires that you use the Obsidian Scholar plugin for Obsidian.**

### Why not extend Obsidian Scholar itself?

Obsidian plugins (including Obsidian Scholar) use the `request()` function as [documented in the Obsidian API](https://docs.obsidian.md/Reference/TypeScript+API/request). This is incredibly useful, but is seen by some servers as an automated call (a bot). IEEE Xplore, for example, returns an HTTP 418 error whenever a request is made from Obsidian (essentially a refusal of service).

This extension gets around this problem, as you, the user, are requesting the webpage in your browser (and you are, hopefully, not a bot). The extension is simply extracting information from the webpage that has already been served to you. The extension then encodes the extracted information into a URI string and passes it to Obsidian, where Obsidian Scholar takes care of actually saving it in your library.

The original import flow in Obsidian Scholar still requires you to input a URL for the paper, so unless you have the URL saved somewhere, you are likely already opening the URL in your browser. This extension is thus designed to minimize any additional work you need to do to import the paper.

> **This extension is not a web crawler, and will not go out and grab papers for you.** This extension simply automates the process of importing papers you already have opened in your browser.

## Prerequisites - Setup

This browser extension requires Obsidian and the Obsidian Scholar plugin to work. Make sure you have everything set up to import papers into your library. This is a one-time setup.

### 1. Install Obsidian

Obsidian can be downloaded and isntalled for free from the [Obsidian website](https://obsidian.md/).

### 2. Install Obsidian Scholar community plugin (forked version)

This extension is used with the Obsidian Scholar plugin, but depends on functionality that has not yet been pulled into the main plugin (you can track the status of the pull request [here](https://github.com/lolipopshock/obsidian-scholar/pull/34)). For now, you will need to install the forked version manually. Instructions can be found in the [Obsidian Scholar (forked version)](https://github.com/MichaelKintscher/obsidian-scholar/tree/dev-create-note-paperdata) github readme.

**Make sure you clone from the branch "dev-create-note-paperdata" in the forked repository.**

### 3. Configure your library

In the Obsidian Scholar settings, make sure you set the "Note folder" and "PDF folder" settings set. This tells the Obsidian Scholar plugin where to save your paper notes and PDF files. When you use this Helper extension, the papers you send to Obsidian will be saved to these locations.

## Installation

This extension has been submitted to [addons.mozilla.org](https://addons.mozilla.org/) for approval to be listed. Until then, you can install the extension yourself using the following steps.

### 1. Fork this github repository, or download the files.

You will need the full repository. If you fork the repository, you can still receive updates. Either way, remember the location where you locally cloned your fork, or where you saved the downloaded files.

### 2. Open the About Debugging Firefox page.

1. Either type `about:debugging` into the URL bar, or go to `Tools > Browser Tools > Remote Debugging`.
2. From there, click on `This Firefox`.

You can find the steps on [Firefox's documentation](https://firefox-source-docs.mozilla.org/devtools-user/about_colon_debugging/index.html).

### 3. Load a temporary extension.

1. Click the button `Load Temporary Add-on...`.
2. Navigate to the `src` folder within the extension directory you saved in Step 1.
3. Click on the `manifest.json` file and open it.

Obsidian Scholar Helper should now appear as a temporary add-on, and is ready for use!

> **Note:** Steps 2 and 3 will need to be repeated each time you restart Firefox. This will be resolved once the extension is signed by Mozila.

## Using the extension

Once everything is set up to import papers into your library, you are ready to use the extension.

### 1. Navigate to web page with the paper you want to import.

The extension will only work on the following list of supported websites. On those websites, the extension only works on paper pages. Non-paper pages (such as the home page, or search results, or a header page) on these sites will show an error message "Oops! Looks like this isn't a paper page!".

 - [ACM Digital Library](https://dl.acm.org/)
 - [IEEE _Xplore_](https://ieeexplore.ieee.org/) 

### 2. Open the extension and click "Send paper to Obsidian".

Your browser may prompt you asking for permission to open the obsidian link with an external program. You will need to say yes.

This will only be available on the domains matching the supported website list above. The extension's page action (button in the Firefox URL bar) is not available on any other pages.

### OR Use the keyboard shortcut to send the paper to Obsidian.

The default shortcut is `Ctrl + Alt + O`. You can adjust the keybinding through the Firefox Add-ons Manager. Similar to the popup UI, this shortcut will only work on paper pages on domains matching the supported website list above.

### 3. View the paper in Obsidian!

The paper data will be added to your library, the same as if you had used the `Scholar: Add paper to Library` command in the Obsidian Scholar plugin. You can now use the Obsidian Scholar plugin with the imported paper!

> **Note:** The Helper extension does not currently support importing PDFs. You will need to download the paper PDF yourself, and then manually add it to the paper after importing the paper into your library. You can do so with the "Scholar: Add Paper PDF" command in Obsidian.

## Acknowledgements

This extension is only possible because of the fantastic work on the original [Obsidian Scholar plugin](https://github.com/lolipopshock/obsidian-scholar)!