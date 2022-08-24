const popupSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 11" fill="currentColor">
                    <rect x=".75" y=".75" width="14.5" height="9.5" rx="2.7" ry="2.7" fill="none" stroke="currentColor" stroke-width="1.5"/>
                    <rect class="inner" x="2.6" y="2.6" width="5" height="2.5" rx=".4" ry=".4"/>
                  </svg>`;

const popup = new DOMParser().parseFromString(popupSVG, 'image/svg+xml');

function miniplayer() {
  document.body.classList.toggle('spopupfy');
  if (document.body.classList.contains('spopupfy')) {
    chrome.runtime.sendMessage({ text: "spopupfy" });
  }
  else {
    chrome.runtime.sendMessage({ text: "backToSpotify" });
  }
}

const addButton = function () {
  let button = document.getElementById('spopupfy-button');
  if (!button) {
    button = document.createElement('button');
    button.id = 'spopupfy-button';
    button.appendChild(popup.documentElement.cloneNode(true));

    document.body.appendChild(button);
  }
  button.addEventListener('click', miniplayer);
}
function addBGImage(image) {
  let footer = document.querySelector('footer');
  let background = document.querySelector('.spf-background-image');
  if (!background) {
    background = document.createElement('img');
    background.classList.add('spf-background-image');
    footer.appendChild(background);
  }
  // Listens for src change on the image
  let observer = new MutationObserver((changes) => {
    changes.forEach(change => {
      if (change.attributeName.includes('src')) {
        background.src = image.src;
      }
    });
  });
  observer.observe(image, { attributeFilter: ["src"] });
  background.src = image.src;
  image.id = 'spf-cover-art';
}

// Listens for the removal of the cover image (when Spotify replaces it with an ad), then resets the cover art observer
function watchForImageRemoval() {
  const observer = new MutationObserver(() => {
    if (!document.getElementById('spf-cover-art')) {
      console.log("SPOPUPFY: Ad detected - Re-attaching cover-art listener");
      waitForElm('.cover-art-image').then((element) => {
        addBGImage(element);
      });
    }
  });

  observer.observe(document.querySelector('[data-testid="now-playing-widget"]'), {
    childList: true,
    subtree: true
  });
}

function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector));
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}


addButton();

waitForElm('.cover-art-image').then((element) => {
  addBGImage(element);
});

watchForImageRemoval();
