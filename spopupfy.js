const popupSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 11" fill="currentColor">
                    <rect x=".75" y=".75" width="14.5" height="9.5" rx="2.7" ry="2.7" fill="none" stroke="currentColor" stroke-width="1.4"/>
                    <rect class="inner" x="2.6" y="2.6" width="5" height="2.5" rx=".4" ry=".4"/>
                  </svg>`;

const popup = new DOMParser().parseFromString(popupSVG, 'image/svg+xml');

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
  let observer = new MutationObserver((changes) => {
    changes.forEach(change => {
      if (change.attributeName.includes('src')) {

        // Makes a second image for a smooth fade-in transition
        let oldbg = document.createElement('img');
        oldbg.id = 'spf-old-cover';
        oldbg.src = background.src;
        footer.appendChild(oldbg);
        background.classList.add("transparent");
        background.src = image.src;
        setTimeout(function(){
          background.classList.remove("transparent");
          setTimeout(function(){
            oldbg.style.opacity = 0;
            setTimeout(function(){
              footer.removeChild(oldbg);
            }, 1000);
          },1100);
        }, 100);
        
      }
    });
  });
  observer.observe(image, { attributeFilter: ["src"] });
  background.src = image.src;
}

// Listens for the removal of the cover image (when Spotify replaces it with an ad), then resets the cover art observer
function watchForImageRemoval() {
  const observer = new MutationObserver(() => {
    if (!document.getElementById('spf-cover-art')) {
      console.log('SPOPUPFY: Cover art removed, fixing');
      waitForElm('.cover-art-image').then((element) => {
        addBGImage(element);
      });
    }
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

//Watches for missing cover image every 2 minutes
setInterval(() => {
  if (!document.getElementById('spf-cover-art')) {
    console.log('SPOPUPFY: Interval - Fixing cover art');
    waitForElm('.cover-art-image').then((element) => {
      addBGImage(element);
    });
  }
}, 120000);
