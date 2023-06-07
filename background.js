const defaultPreferences = {
  windowLeft: 0,
  windowTop: 0,
  windowWidth: 450,
  windowHeight: 170
};

let preferences;

// Load preferences from storage
browser.storage.local.get('preferences', (result) => {
  preferences = result.preferences || structuredClone(defaultPreferences);
});


let originalWindow = 1;

const storePreferences = (windowInfo) => {
  preferences.windowTop = windowInfo.top;
  preferences.windowLeft = windowInfo.left;
  preferences.windowWidth = windowInfo.width;
  preferences.windowHeight = windowInfo.height;

  browser.storage.local.set({ preferences: preferences });
}

const resetPreferences = (windowId) => {
  preferences = structuredClone(defaultPreferences)
  browser.storage.local.set({ preferences: preferences });
  chrome.windows.update(windowId, { top: preferences.windowTop, left: preferences.windowLeft, width: preferences.windowWidth, height: preferences.windowHeight });
}

const popupWindow = (tab) => {

  let top = preferences.windowTop;
  let left = preferences.windowLeft;
  let width = preferences.windowWidth;
  let height = preferences.windowHeight;

  let settings = {
    type: 'popup',
    top: top,
    left: left,
    width: width,
    height: height,
    tabId: tab.id
  };

  chrome.windows.create(settings, windowInfo => {
    chrome.windows.update(windowInfo.id, { focused: false, top: top, left: left, width: width, height: height });
  });
};


const mergeTab = (tabId, windowId) => {
  //create new window if the original has been closed
  chrome.windows.get(windowId, function (window) {
    if (chrome.runtime.lastError) {
      chrome.windows.create({ tabId: tabId, width: 1000, height: 800 });
      return;
    }
  });

  chrome.tabs.move(tabId, { windowId: windowId, index: -1 });
  chrome.windows.update(windowId, { focused: true });
  chrome.tabs.update(tabId, { active: true });
}


chrome.runtime.onMessage.addListener(function (msg, sender) {
  if (msg.text == "spopupfy") {
    originalWindow = sender.tab.windowId;
    popupWindow(sender.tab);
  }
  else if (msg.text == "backToSpotify") {

    // get window size and position and store them in local storage
    // chrome.windows.get(sender.tab.windowId, function (window) {
    //   storePreferences({ top: window.top, left: window.left, width: window.width, height: window.height });
    // });
    mergeTab(sender.tab.id, originalWindow);
  }
  else if (msg.text == "resetInfo") {
    resetPreferences(sender.tab.windowId);
  }
  else if(msg.text == "saveInfo"){
    chrome.windows.get(sender.tab.windowId, function (window) {
      storePreferences({ top: window.top, left: window.left, width: window.width, height: window.height });
    });
  }
});