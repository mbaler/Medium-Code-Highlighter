const codeBlocks = document.querySelectorAll("pre");


// is this a Medium page? if so, highlight
if (isMedium()) {
    chrome.runtime.sendMessage({status: "willHighlight"});
    chrome.storage.sync.get(["theme"], (result) => {
        highlight(result.theme, codeBlocks);
    });
} else {
    chrome.runtime.sendMessage({status: "wontHighlight"});
}

// listener for re-highlights upon new theme selection
chrome.runtime.onMessage.addListener(
    (req, sender, sendResponse) => {
        if (req.action === "rehighlight") {
            highlight(req.theme, codeBlocks);
        }
    }
);


/**
 * is this a Medium page? 
 * @returns {boolean}
 */
function isMedium() {
    // first, easy domain check
    if (window.location.hostname === "medium.com") {
        return true;
    }

    // second, check logo element, as some pages are on domains other than "medium"
    const logoElts = document.querySelectorAll("div.js-metabarLogoLeft > a.siteNav-logo");

    if (logoElts.length === 0) {
        return false;
    }
    if (logoElts[0].getAttribute("href") !== "https://medium.com/") {
        return false;
    }

    return true;
}

/**
 * highlighter
 * @param {string} theme 
 * @param {HTMLElement[]} codeBlocks code to highlight
 */
function highlight(theme, codeBlocks) {
    // insert user-selected CSS theme into page head
    const link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.classList.add("mchStyle");
    link.href = chrome.runtime.getURL(`highlightjs/styles/${theme}.css`);
    
    // remove any old styles
    const existingLinks = document.querySelectorAll("link.mchStyle");
    existingLinks.forEach(function(existingLink){
        existingLink.parentNode.removeChild(existingLink);
    });

    // add current new style
    document.head.appendChild(link);

    // highlight all <pre> elements with hljs
    codeBlocks.forEach((block) => {
        hljs.highlightBlock(block);
    });
}
