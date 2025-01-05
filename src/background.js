chrome.action.onClicked.addListener((tab) => {
  const tabUrl = tab.url;
  const tabIndex = tab.index;
  let newUrl;

  const path = tabUrl.split('/');
  const protocol = path[0];
  const host = path[2];
  const uri = path[3];
  const base = `${protocol}//${host}`;

  chrome.tabs.sendMessage(tab.id, { 
      command: 'getManager' 
    }, 
    (sysObject) => {
    let createTab = false;
    //  if Queeg is detected, go to manager like a boss!
    if (sysObject) {
      newUrl = `${sysObject.host}${sysObject.manager}?a=resource/update&id=${sysObject.id}`;
      createTab = true;
      // w/o Queeg: Just try to leave manager
    } else if (uri === 'manager') {
      newUrl = base;
      chrome.action.setTitle({ 
        title: 'Preview MODX website' 
      });
      createTab = true;
    } else {
      // w/o Queeg: Just try to open manager
      findManagerPath(host, base, (newUrl) => {
        chrome.tabs.create({ 
          url: newUrl, 
          index: tabIndex + 1 
        });
      });
    }

    if (createTab) {
      chrome.tabs.create({ 
        url: newUrl, 
        index: tabIndex + 1 
      });
    }
  });
});

const cleanProtocolEtc = (host) => {
  return host
    .replace('https://www.', '')
    .replace('http://www.', '')
    .replace('https://', '')
    .replace('http://', '');
}

const findManagerPath = (hostInput, base, callbackSuccess) => {
  let managerPath = 'manager';
  let newUrl = `${base}/${managerPath}`;
  const host = cleanProtocolEtc(hostInput);

  chrome.storage.sync.get('paths', (result) => {
    if (result && result.paths && Array.isArray(result.paths)) {
      result.paths.forEach((path) => {
        path.siteUrl = cleanProtocolEtc(path.siteUrl);
        if (host.includes(path.siteUrl)) {
          managerPath = path.managerPath;
          newUrl = `${base}/${managerPath}`;
        }
      });
    } else {
      console.warn('Paths not found in storage');
    }
    callbackSuccess(newUrl);
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let badgeColor;

  // Process system object
  if (message.system) {
    delete message.system;

    badgeColor = message.published === 0 ? errorColor : successColor;

    animateFlip(sender.tab.id);

    chrome.action.setBadgeText({ 
      text: message.id.toString(), 
      tabId: sender.tab.id 
    });
    chrome.action.setBadgeBackgroundColor({ 
      color: badgeColor, 
      tabId: sender.tab.id 
    });
  } else {
    // Process content object
    delete message.system;
    const tooltip = Object.entries(message).map(([key, value]) => `${key}: ${value}`).join('\n');

    chrome.action.setTitle({ 
      title: tooltip, 
      tabId: sender.tab.id 
    });
  }
});

// Change badge and icon onMessage
const badgeColor = [0, 0, 0, 255];
const successColor = [95, 181, 77, 255];
const errorColor = [229, 62, 48, 255];
const animationFrames = 36;
const animationSpeed = 20;
let rotation = 0;
let tab;

const resetActiveIcon = (tabId) => {
  chrome.action.setIcon({ 
    path: { 
      '19': 'images/icon19.png', 
      '38': 'images/icon38.png' 
    }, 
    tabId 
  });
};

const animateFlip = (tabId) => {
  tab = tabId || tab;
  rotation += 1 / animationFrames;
  drawIconAtRotation(tab);

  if (rotation <= 1) {
    setTimeout(() => animateFlip(tab), animationSpeed);
  } else {
    rotation = 0;
    resetActiveIcon(tab);
  }
};

const ease = (x) => (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;

const drawIconAtRotation = async (tabId) => {
  const canvas = new OffscreenCanvas(38, 38);
  const ctx = canvas.getContext('2d');

  // Fetch the image data
  const response = await fetch(chrome.runtime.getURL('images/icon38.png'));
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(2 * Math.PI * ease(rotation));
  ctx.drawImage(bitmap, -canvas.width / 2, -canvas.height / 2);
  ctx.restore();

  chrome.action.setIcon({
    imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
    tabId: tabId,
  });
};
