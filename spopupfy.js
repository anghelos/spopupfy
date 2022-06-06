
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
  let button = document.querySelector('.spopupfy-button');
  if (!button) {
    button = document.createElement('button');
    button.classList.add('spopupfy-button');
    button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-aspect-ratio" viewBox="0 0 16 16">
  <path d="M0 3.5A1.5 1.5 0 0 1 1.5 2h13A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5v-9zM1.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-13z"/>
  <path d="M2 4.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1H3v2.5a.5.5 0 0 1-1 0v-3zm12 7a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1H13V8.5a.5.5 0 0 1 1 0v3z"/>
</svg>`;

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
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.removedNodes.length > 0) {
        mutation.removedNodes.forEach(node => {
          if (!document.getElementById('spf-cover-art')) {
            waitForElm('.cover-art-image').then((element) => {
              addBGImage(element);
            });
          }
        });
      }
    });
  });

  observer.observe(document.querySelector('footer'), {
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
