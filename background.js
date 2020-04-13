// Every languages supported by DeepL and its corresponding URL arg
const translateIn = {"French" : "fr", "English" : "en", "German" : "ge", "Spanish" : "es", "Japanese" : "ja", "Portuguese" : "pt-PT", "Portugues (Brazilian)" : "pt-BR", "Italian" : "it", "Dutch" : "nl", "Polish" : "pl", "Russian" : "ru", "Chinese (simplified)" : "zh"}

// Get the selectedText and the saved language and put it in the URL
const translateSelectedText = async (selectedText) => {
    chrome.storage.sync.get("TranslateInLanguage", function (items) {
        const TranslateInLanguage = items.TranslateInLanguage;
        const createProperties = {url: `https://www.deepl.com/en/translator#auto/${TranslateInLanguage}/${encodeURI(selectedText)}`};

        chrome.tabs.create(createProperties);
    });
}

// Handle every click on context menus
const onClickHandler = (info, tab) => {

    // If its the result of a click on a context menu related to a select text
    // Get the selected text and run the callback
    if (info.menuItemId === "contextselection") {
        chrome.tabs.executeScript( {
            code: "window.getSelection().toString();"
        }, translateSelectedText);
    } 
    // Else if its the result of a click on a radio-button to choose a language
    // Set the selected language to the synced storage
    else if (info.menuItemId.startsWith("SubTranslateInLanguage")) {
        console.log(info.menuItemId.replace("SubTranslateInLanguage", ""));
        chrome.storage.sync.set({TranslateInLanguage: info.menuItemId.replace("SubTranslateInLanguage", "")});
    }
};

// Setup default value of the final translation language in the synced storage, default = French
const setupDefaultValues = () => {
    chrome.storage.sync.get(["LanguageToTranslate", "TranslateInlanguage"], function (items) {
        const TranslateInLanguage = items.TranslateInLanguage;

        if (TranslateInLanguage == undefined) {
            chrome.storage.sync.set({TranslateInLanguage: "French"});
        }
    });
}

// Setup the selection and the setup translated lanage menus
const setupMenus = () => {
    chrome.contextMenus.create({title: "Search %s with Deepl", contexts:["selection"], id: "contextselection"});
    chrome.contextMenus.create({title : "Setup translated language", id: "parentSQDS"});

    for (const key in translateIn) {
        chrome.contextMenus.create({type: "radio", title : key, id: "SubTranslateInLanguage" + translateIn[key], parentId: "parentSQDS"});
    }
}

// Main setup
const setupDeeplSearch = (() => {
    chrome.runtime.onInstalled.addListener(function() {
          setupDefaultValues();
          setupMenus();
      });
})();

// Add listener to know when user click on context menus
chrome.contextMenus.onClicked.addListener(onClickHandler);
