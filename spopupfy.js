const popupSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 11" fill="currentColor">
<rect x=".75" y=".75" width="14.5" height="9.5" rx="2.7" ry="2.7" fill="none" stroke="currentColor" stroke-width="1.4"/>
<rect class="inner" x="2.6" y="2.6" width="5" height="2.5" rx=".4" ry=".4"/>
</svg>`;

const popupIMG = new DOMParser().parseFromString(popupSVG, 'image/svg+xml');

const saveSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 13.5" fill="currentColor">
<mask id="floppy">
  <rect x="0" y="0" width="100%" height="100%" fill="white"/>
<rect x="3.75" y="6.5" width="8.5" height="5.5" rx=".4" ry=".4" fill="black"/>
<rect x="4.5" y="1.5" width="5.75" height="2.5" rx=".4" ry=".4" fill="black"/>
<rect mask="url(#floppy)" x="2" y=".75" width="12" height="12" rx="1.5" ry="1.5" fill="none" stroke="white" stroke-width="1.4"/>
<rect x="13" y="-2" width="6" height="4"  fill="black" transform="rotate(45, 15, -2)"/>
</mask>
<rect mask="url(#floppy)" x="2" y=".75" width="12" height="12" rx="1.5" ry="1.5" fill="currentcolor" stroke="currentColor" stroke-width="1.4"/>
<rect x="7.75" y=".75" width="1.4" height="2.25" rx=".4" ry=".4" fill="currentColor"/>
</svg>`;
const saveIMG = new DOMParser().parseFromString(saveSVG, 'image/svg+xml');

let oldsrc = '';

let footer;

// Listens for the removal of the cover image (when Spotify replaces it with an ad), then resets the cover art observer
const BackupObserver = new MutationObserver(() => {
  // console.log('SPOPUPFY: Mutation observed');
  let cover = document.getElementById('spf-cover-art');
  if (!cover) {
    console.log('SPOPUPFY: Cover art removed, fixing');
    setTimeout(() => {
      waitForElm('[data-testid="cover-art-image"]').then((element) => {
        addBGImage(element);
      });
    }, 800);
  }
  else if (cover.src != oldsrc) {
    changeImage(cover);
  }
});



// Activates the image observer
function watchForImageRemoval(element) {
  // console.log('SPOPUPFY: Attempting to watch for image removal');
  BackupObserver.observe(element, {
    childList: true,
    subtree: true
  });
  // console.log('SPOPUPFY: Footer observer started');
}

function miniplayer() {
  document.body.classList.toggle('spopupfy');
  if (document.body.classList.contains('spopupfy')) {
    chrome.runtime.sendMessage({ text: "spopupfy" });
  }
  else {
    chrome.runtime.sendMessage({ text: "backToSpotify" });
  }
}

function saveInfo() {
  chrome.runtime.sendMessage({ text: "saveInfo" });
}

function resetInfo() {
  chrome.runtime.sendMessage({ text: "resetInfo" });
}

const addButton = function () {
  let button = document.getElementById('spopupfy-button');
  let save = document.getElementById('spopupfy-save');
  let reset = document.getElementById('spopupfy-reset');

  if (!button) {
    let menu = document.createElement('div');
    menu.id = 'spopupfy-menu';
    button = document.createElement('button');
    button.id = 'spopupfy-button';
    button.title = 'Toggle miniplayer';
    save = document.createElement('button');
    save.id = 'spopupfy-save';
    save.title = 'Save size/position';
    reset = document.createElement('button');
    reset.id = 'spopupfy-reset';
    reset.title = 'Reset size/position';

    button.appendChild(popupIMG.documentElement.cloneNode(true));
    save.appendChild(saveIMG.documentElement.cloneNode(true));
    reset.appendChild(saveIMG.documentElement.cloneNode(true));

    menu.appendChild(button);
    menu.appendChild(save);
    menu.appendChild(reset);
    document.body.appendChild(menu);
  }
  button.addEventListener('click', miniplayer);
  save.addEventListener('click', saveInfo);
  reset.addEventListener('click', resetInfo);
}


function addBGImage(image) {
  let background = document.getElementById('spf-background-image');
  footer = footer ? footer : document.querySelector('footer');
  image.id = 'spf-cover-art';

  if (!background) {
    background = document.createElement('img');
    background.id = 'spf-background-image';
    background.src = image.src;
    oldsrc = image.src;
    footer.appendChild(background);
  }

  changeImage(image, background);
}


function changeImage(cover, background) {
  background = background ? background : document.getElementById('spf-background-image');
  footer = footer ? footer : document.querySelector('footer');

  if (!background) {
    addBGImage(cover);
    return;
  }

  let oldbg = document.createElement('img');
  oldbg.id = 'spf-old-cover';
  oldbg.src = oldsrc;
  footer.appendChild(oldbg);

  background.classList.add("transparent");
  background.src = cover.src;
  oldsrc = cover.src;

  setTimeout(function () {
    background.classList.remove("transparent");
    setTimeout(function () {
      oldbg.style.opacity = 0;
      setTimeout(function () {
        footer.removeChild(oldbg);
      }, 1000);
    }, 1100);
  }, 100);

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


waitForElm('[data-testid="cover-art-image"]').then((element) => { addBGImage(element) });

waitForElm('[data-testid="now-playing-widget"]').then((element) => { watchForImageRemoval(element) });

// On window resize, ask if user wants to save the new size, then send message to background.js
// window.addEventListener('resize', () => {

//   // create toast message
//   let toast = document.createElement('div');
//   toast.id = 'spopupfy-toast';
//   toast.innerHTML = 'Save new size/position?';

//   chrome.runtime.sendMessage({ text: "savePrefs" });
// });
