// Actions onClicked
chrome.browserAction.onClicked.addListener(function(tab) {
    var tab_url = tab.url;
    var tabIndex = tab.index;
    var newUrl;

    var path = tab_url.split( '/' );
    var protocol = path[0];
    var host = path[2];
    var uri = path[3];
    var base = protocol + '//' + host;

    chrome.tabs.sendMessage(tab.id, {
      command: "getManager"
    },

    function(docid) {
        if (uri != 'manager') {
            newUrl = base + '/' + 'manager';
                if (docid) {
                    newUrl += '/?a=resource/update&id=' + docid;
                }
            chrome.browserAction.setTitle({title:"Preview MODX website"});
        } else {
            newUrl = base;
        }

        chrome.tabs.create({
            url: newUrl,
            index: tabIndex + 1
        });
    });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.published === 0) { badge_color = error_color };
        if (request.published === 1) { badge_color = success_color };

        var tooltip = [];
        for(var key in request) {
            tooltip.push(key + ": " + request[key]);
        }

        animateFlip();

        chrome.browserAction.setBadgeText ({
            text: request.published.toString(),
            tabId: sender.tab.id
        });

        chrome.browserAction.setBadgeBackgroundColor({
            color: badge_color,
            tabId: sender.tab.id
        });

        chrome.browserAction.setTitle({
            title: tooltip.join('\n'),
            tabId: sender.tab.id
        });
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

function resetIcon() {
    chrome.browserAction.setIcon({
        path: {
            "19": "images/icon19.png",
            "38": "images/icon38.png"
        }
    });
}

function animateFlip() {
    rotation += 1/animationFrames;
    drawIconAtRotation();

    if (rotation <= 1) {
        setTimeout(animateFlip, animationSpeed);
    } else {
        rotation = 0;
        resetIcon();
    }
}

function ease(x) {
    return (1 - Math.sin(Math.PI/2 + x * Math.PI))/2;
}

function drawIconAtRotation() {
    canvasContext.save();
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.translate(Math.ceil(canvas.width/2), Math.ceil(canvas.height/2));
    canvasContext.rotate(2*Math.PI*ease(rotation));
    canvasContext.drawImage(icon, -Math.ceil(canvas.width/2), -Math.ceil(canvas.height/2));
    canvasContext.restore();

    chrome.browserAction.setIcon({imageData:canvasContext.getImageData(0, 0, canvas.width,canvas.height)});
}