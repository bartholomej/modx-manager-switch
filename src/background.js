// Actions onClicked
chrome.browserAction.onClicked.addListener(function(tab) {
  const tab_url = tab.url;
  const tabIndex = tab.index;
  let newUrl;

  const path = tab_url.split('/');
  const protocol = path[0];
  const host = path[2];
  const uri = path[3];
  const base = protocol + '//' + host;

  chrome.tabs.sendMessage(tab.id, {
      command: "getManager"
    },
    function(sysObject) {
      let createTab = false;
      //  if Queeg is detected, go to manager like a boss!
      if (sysObject) {
        newUrl = sysObject.host + sysObject.manager;
        newUrl += '?a=resource/update&id=' + sysObject.id;
        createTab = true;
      } else {
        // w/o Queeg: Just try to leave manager
        if (uri == 'manager') {
          newUrl = base;
          chrome.browserAction.setTitle({
            title: "Preview MODX website"
          });
          createTab = true;
        } else {
          // w/o Queeg: Just try to open manager
          const managerPath = findManagerPath(host, base, (newUrl) => {
            chrome.tabs.create({
                url: newUrl,
                index: tabIndex + 1
            });
          });
          // newUrl = base + '/manager';
        }
      }

      if (createTab) {
        chrome.tabs.create({
            url: newUrl,
            index: tabIndex + 1
        });
      }
    });
});

function findManagerPath(hostInput, base, callbackSuccess) {
  let host = hostInput;

  let managerPath = 'manager';
  let newUrl = base + '/' + managerPath;

  host.replace('https://www.');
  host.replace('http://www.');
  host.replace('https://');
  host.replace('http://');

  chrome.storage.sync.get('paths', function(result) {
    if (result && 'paths' in result && Array.isArray(result.paths)) {
      result.paths.forEach((path) => {
        if (host.indexOf(path.siteUrl) >= 0) {
          managerPath = path.managerPath;
          newUrl = base + '/' + managerPath;
        }
      });
    } else {
      console.warn('Paths not found in storage');
    }
    callbackSuccess(newUrl);
  });
}

chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {

    // Process system object
    if (message.system) {
      delete message.system;

      if (message.published === 0) {
        badge_color = error_color
      };
      if (message.published === 1) {
        badge_color = success_color
      };

      animateFlip(sender.tab.id);

      chrome.browserAction.setBadgeText({
        text: message.id.toString(),
        tabId: sender.tab.id
      });

      chrome.browserAction.setBadgeBackgroundColor({
        color: badge_color,
        tabId: sender.tab.id
      })
    } else {
      // Process content object
      delete message.system;

      var tooltip = [];
      for (var key in message) {
        tooltip.push(key + ": " + message[key]);
      }

      chrome.browserAction.setTitle({
        title: tooltip.join('\n'),
        tabId: sender.tab.id
      });
    }
  }
);

// Change badge and icon onMessage
var badge_color = [0, 0, 0, 255];
var success_color = [95, 181, 77, 255];
var error_color = [229, 62, 48, 255];

var animationFrames = 36;
var animationSpeed = 20; // ms
var canvas = document.getElementById('canvas');
var icon = document.getElementById('icon');
var canvasContext = canvas.getContext('2d');
var rotation = 0;
var tab;

function resetActiveIcon(tabId) {
  chrome.browserAction.setIcon({
    path: {
      "19": "images/icon19.png",
      "38": "images/icon38.png"
    },
    tabId: tabId
  });
}

function animateFlip(tabId) {
  tab = tabId || tab;
  rotation += 1 / animationFrames;
  drawIconAtRotation(tab);

  if (rotation <= 1) {
    setTimeout(animateFlip, animationSpeed);
  } else {
    rotation = 0;
    resetActiveIcon(tab);
  }
}

function ease(x) {
  return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
}

function drawIconAtRotation(tabId) {
  canvasContext.save();
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.translate(Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
  canvasContext.rotate(2 * Math.PI * ease(rotation));
  canvasContext.drawImage(icon, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
  canvasContext.restore();

  chrome.browserAction.setIcon({
    imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height),
    tabId: tabId
  });
}
