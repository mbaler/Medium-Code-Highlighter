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

    // second, see if this is a non-medium domain, but still medium content
    const metaApp = document.querySelector("meta[name='twitter:app:name:iphone']");
    if (metaApp !== null && metaApp.getAttribute("content") === "Medium") {
        return true;
    }

    // third, check logo element
    const logoElts = document.querySelectorAll("div.js-metabarLogoLeft > a.siteNav-logo");
    if (logoElts.length > 0 && logoElts[0].getAttribute("href") === "https://medium.com/") {
        return true;
    }

    return false;
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
