document.addEventListener("DOMContentLoaded", (event) => {
    const radioInputs = document.querySelectorAll("input[type='radio'][name='theme']");
    const choices = document.querySelectorAll("div.choice");
    const head = document.head;

    const example = document.querySelector("div#example-block pre");
    hljs.highlightBlock(example);
    

    // show preferred theme as selected, highlight example text w/ said theme
    chrome.storage.sync.get(["theme"], (result) => {
        document.querySelector(`input#${result.theme}`).checked = true;
        _highlightExample(result.theme);
    });

    // handle if preferred theme is changed
    radioInputs.forEach((input) => {
        input.addEventListener("change", changeHandler);
    });

    // handle example text highlights on choice hover
    choices.forEach((choice) => {
        choice.addEventListener("mouseenter", (event) => {
            _highlightExample(event.target.firstElementChild.value);
        });
    });

    // when mouse leaves popup, restore example highlight to selected preferred theme
    document.addEventListener("mouseleave", (event) => {
        chrome.storage.sync.get(["theme"], (result) => {
            _highlightExample(result.theme);
        });
    });


    /**
     * preferred theme change handler
     * @param {Event} event 
     */
    function changeHandler(event) {
        const newValue = this.value;
        
        // set new preferred
        chrome.storage.sync.set({theme: newValue});

        // re-highlight
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: "rehighlight", theme: newValue});
        });

        // highlight example text
        _highlightExample(newValue);
    }

    /**
     * highlight example preview code
     * @param {string} style 
     * private
     */
    function _highlightExample(style) {
        // first delete any existing stylesheets
        const toDelete = document.querySelectorAll("link.highlightStyle");
        if (toDelete.length > 0) {
            toDelete.forEach((link) => {
                link.parentNode.removeChild(link);
            });
        }

        // then add one for new style
        const newLink = document.createElement("link");
        newLink.type = "text/css";
        newLink.rel = "stylesheet";
        newLink.className = "highlightStyle";
        newLink.href = `/highlightjs/styles/${style}.css`;
        head.appendChild(newLink);
    }
});
