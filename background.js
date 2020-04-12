// Every langages supported by DeepL and its corresponding URL arg
const translateIn = {"French" : "fr", "English" : "en", "German" : "ge", "Spanish" : "es", "Japanese" : "ja", "Portuguese" : "pt-PT", "Portugues (Brazilian)" : "pt-BR", "Italian" : "it", "Dutch" : "nl", "Polish" : "pl", "Russian" : "ru", "Chinese (simplified)" : "zh"}

// Get the selectedText and the saved langage and put it in the URL
const translateSelectedText = async (selectedText) => {
    chrome.storage.sync.get("TranslateInLangage", function (items) {
        const TranslateInLangage = items.TranslateInLangage;
        const createProperties = {url: `https://www.deepl.com/en/translator#auto/${TranslateInLangage}/${encodeURI(selectedText)}`};

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
    // Else if its the result of a click on a radio-button to choose a langage
    // Set the selected langage to the synced storage
    else if (info.menuItemId.startsWith("SubTranslateInLangage")) {
        console.log(info.menuItemId.replace("SubTranslateInLangage", ""));
        chrome.storage.sync.set({TranslateInLangage: info.menuItemId.replace("SubTranslateInLangage", "")});
    }
};

// Setup default value of the final translation langage in the synced storage, default = French
const setupDefaultValues = () => {
    chrome.storage.sync.get(["LangageToTranslate", "TranslateInlangage"], function (items) {
        const TranslateInLangage = items.TranslateInLangage;

        if (TranslateInLangage == undefined) {
            chrome.storage.sync.set({TranslateInLangage: "French"});
        }
    });
}

// Setup the selection and the setup translated lanage menus
const setupMenus = () => {
    chrome.contextMenus.create({title: "Search %s with Deepl", contexts:["selection"], id: "contextselection"});
    chrome.contextMenus.create({title : "Setup translated langage", id: "parentSQDS"});

    for (const key in translateIn) {
        chrome.contextMenus.create({type: "radio", title : key, id: "SubTranslateInLangage" + translateIn[key], parentId: "parentSQDS"});
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
