chrome.action.onClicked.addListener((tab) => {
  const { url: tabUrl, index: tabIndex } = tab;
  const path = tabUrl.split('/');
  const [protocol, , host, uri] = path;
  const base = `${protocol}//${host}`;

  chrome.tabs.sendMessage(tab.id, { command: 'getManager' }, (sysObject) => {
    let createTab = false;
    let newUrl;

    if (sysObject) {
      newUrl = `${sysObject.host}${sysObject.manager}?a=resource/update&id=${sysObject.id}`;
      createTab = true;
    } else if (uri === 'manager') {
      newUrl = base;
      chrome.action.setTitle({ title: 'Preview MODX website' });
      createTab = true;
    } else {
      findManagerPath(host, base, (newUrl) => {
        chrome.tabs.create({ url: newUrl, index: tabIndex + 1 });
      });
    }

    if (createTab) {
      chrome.tabs.create({ url: newUrl, index: tabIndex + 1 });
    }
  });
});

const cleanProtocolEtc = (host) => host.replace(/https?:\/\/(www\.)?/, '');

const findManagerPath = (hostInput, base, callbackSuccess) => {
  const host = cleanProtocolEtc(hostInput);
  let managerPath = 'manager';
  let newUrl = `${base}/${managerPath}`;

  chrome.storage.sync.get('paths', (result) => {
    if (result?.paths && Array.isArray(result.paths)) {
      result.paths.forEach((path) => {
        if (host.includes(cleanProtocolEtc(path.siteUrl))) {
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

const defaultBadgeColor = [0, 0, 0, 255];
const successColor = [95, 181, 77, 255];
const errorColor = [229, 62, 48, 255];
const animationFrames = 36;
const animationSpeed = 20;
let rotation = 0;
let tab;

chrome.runtime.onMessage.addListener((message, sender) => {
  const {
    tab: { id: tabId },
  } = sender;
  const badgeColor = message.system
    ? message.published === 0
      ? errorColor
      : successColor
    : defaultBadgeColor;

  if (message.system) {
    delete message.system;
    animateFlip(tabId);
    chrome.action.setBadgeText({ text: message.id.toString(), tabId });
    chrome.action.setBadgeBackgroundColor({ color: badgeColor, tabId });
  } else {
    const tooltip = Object.entries(message)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    chrome.action.setTitle({ title: tooltip, tabId });
  }
});

const resetActiveIcon = (tabId) => {
  chrome.action.setIcon({
    path: { 19: 'images/icon19.png', 38: 'images/icon38.png' },
    tabId,
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
    tabId,
  });
};
