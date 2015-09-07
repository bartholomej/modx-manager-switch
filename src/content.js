var META_NAME = 'queeg';
var meta = document.querySelector("meta[name='" + META_NAME + "']");

if (meta) {
    var resData = meta.getAttribute('content'),
        sysData = meta.getAttribute('data-system'),
        resObject = '',
        sysObject = '';

    if (resData && sysData) {
        resObject = JSON.parse(resData);
        sysObject = JSON.parse(sysData);

        resObject.system = false;
        sysObject.system = true;

        chrome.runtime.sendMessage(resObject);
        chrome.runtime.sendMessage(sysObject);
    }
}

/* Listen for messages and get docid meta tag*/
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.command && (msg.command == "getManager")) {
        var response = '';

        if (sysObject) {
            response = sysObject;
        }

        sendResponse(response);
    }
});