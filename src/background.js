const defaultTheme = "monokai-sublime";


// if haven't yet used extension, set preferred theme as default
chrome.storage.sync.get(["theme"], (result) => {
    if (result.theme === undefined) {
        chrome.storage.sync.set({theme: defaultTheme});
    }
});

// Listen for highlight or not, handle icon accordingly
chrome.runtime.onMessage.addListener((req, sender) => {
    if (req.status === "willHighlight") {
        chrome.pageAction.show(sender.tab.id);
        setIcons(sender.tab.id, "active");
        chrome.pageAction.setTitle({
            tabId: sender.tab.id,
            title: "Click to change code syntax highlight theme!"
        });
    } else {
        chrome.pageAction.hide(sender.tab.id);
        setIcons(sender.tab.id, "disabled");
    }
});


/**
 * change icon
 * @param {int} tabId 
 * @param {string} type 
 */
function setIcons(tabId, type) {
    chrome.pageAction.setIcon({
        tabId: tabId, 
        path: {
            16: `icons/16${type}.png`,
            32: `icons/32${type}.png`,
            48: `icons/48${type}.png`,
            128: `icons/128${type}.png`
        }
    });
}
