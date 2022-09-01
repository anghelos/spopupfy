const popupSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 11" fill="currentColor">
                    <rect x=".75" y=".75" width="14.5" height="9.5" rx="2.7" ry="2.7" fill="none" stroke="currentColor" stroke-width="1.4"/>
                    <rect class="inner" x="2.6" y="2.6" width="5" height="2.5" rx=".4" ry=".4"/>
                  </svg>`;

const popup = new DOMParser().parseFromString(popupSVG, 'image/svg+xml');

// Listens for the removal of the cover image (when Spotify replaces it with an ad), then resets the cover art observer
const BackupObserver = new MutationObserver(() => {
  // console.log('SPOPUPFY: Mutation observed');
  if (!document.getElementById('spf-cover-art')) {
    console.log('SPOPUPFY: Cover art removed, fixing');
    setTimeout(() => {
      waitForElm('.cover-art-image').then((element) => {
        addBGImage(element);
      });
    }, 800);
  }
});

let imageObserver = new MutationObserver(() => { });



// Activates the image observer
function watchForImageRemoval() {
  // console.log('SPOPUPFY: Attempting to watch for image removal');
  BackupObserver.observe(document.querySelector('[data-testid="now-playing-widget"]'), {
    childList: true,
    subtree: true
  });
  // console.log('SPOPUPFY: Footer observer started');
}

function miniplayer() {
  document.body.classList.toggle('spopupfy');
  if (document.body.classList.contains('spopupfy')) {
    chrome.runtime.sendMessage({ text: "spopupfy" });
    waitForElm('.cover-art-image').then((element) => {
      addBGImage(element);
    });
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
  let background = document.getElementById('spf-background-image');
  image.id = 'spf-cover-art';
  if (!background) {
    background = document.createElement('img');
    background.id = 'spf-background-image';
    footer.appendChild(background);
  }
  // Listens for src change on the image
  imageObserver = new MutationObserver((changes) => {
    changes.forEach(() => {
        // Makes a second image for a smooth fade-in transition
        let oldbg = document.createElement('img');
        oldbg.id = 'spf-old-cover';
        oldbg.src = background.src;
        footer.appendChild(oldbg);
        background.classList.add("transparent");
        background.src = image.src;
        setTimeout(function () {
          background.classList.remove("transparent");
          setTimeout(function () {
            oldbg.style.opacity = 0;
            setTimeout(function () {
              footer.removeChild(oldbg);
            }, 1000);
          }, 1100);
        }, 100);
    });
  });
  imageObserver.observe(image, { attributeFilter: ["src"] });
  background.src = image.src;
}


function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      // console.log('SPOPUPFY: Element found: ' + selector);
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        // console.log('SPOPUPFY: Element found after a while: ' + selector);
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

waitForElm('.cover-art-image').then((element) => {addBGImage(element)});

waitForElm('[data-testid="now-playing-widget"]').then(watchForImageRemoval);

// //Re-arms the observer every 2 minutes, to account for AdBlockers
// setInterval(() => {
//   watchForImageRemoval();
// }, 120000);
