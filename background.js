let preferences = {
  windowPositionLeft: 0,
  windowPositionTop: 0,
  windowWidth: 475,
  windowHeight: 170,
  openThisLink: true,
  moveThisPage: true,
  moveThisTab: false
};

let originalWindow = null;

const popupWindow = (tab) => {

  let top = preferences.windowPositionTop;
  let left = preferences.windowPositionLeft;
  let width = preferences.windowWidth;
  let height = preferences.windowHeight;

  let setting = {
    type: 'popup',
    top: preferences.windowPositionTop,
    left: preferences.windowPositionLeft,
    width: preferences.windowWidth,
    height: preferences.windowHeight,
    tabId: tab.id
  };
  chrome.windows.create(setting, windowInfo => {
    chrome.windows.update(windowInfo.id, { focused: false, top: top, left: left, width: width, height: height });
  });
};


const moveTab = (tabId, windowId) => {
  chrome.tabs.move(tabId, {windowId: windowId, index: -1});
  chrome.windows.update(windowId, {focused: true});
  chrome.tabs.update(tabId, {active: true});
}


chrome.runtime.onMessage.addListener(function (msg, sender) {
  if (msg.text == "spopupfy") {
    originalWindow = sender.tab.windowId;
    popupWindow(sender.tab);
  }
  else if(msg.text == "backToSpotify"){
    moveTab(sender.tab.id, originalWindow);
  }
});