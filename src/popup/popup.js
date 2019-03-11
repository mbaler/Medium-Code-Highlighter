document.addEventListener("DOMContentLoaded", (event) => {
    const radioInputs = document.querySelectorAll("input[type='radio'][name='theme']");
    const choices = document.querySelectorAll("div.choice");
    const example = document.querySelector("div#example-block pre");
    const allStylesheets = document.querySelectorAll("link.highlightStyle");

    
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
        // first disable all styles other than current desired
        allStylesheets.forEach((link) => {
            link.disabled = link.href.match(`highlightjs/styles/${style}.css`) === null;
        });

        // highlight
        hljs.highlightBlock(example);
    }
});
