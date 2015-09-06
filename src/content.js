var META_NAME = 'queeg';
var meta = document.querySelector("meta[name='" + META_NAME + "']");

if (meta) {
    var resData = meta.getAttribute('content'),
        resObject = '';

    if (resData) {
        resObject = JSON.parse(resData);
        chrome.runtime.sendMessage(resObject);
    }

}

/* Listen for messages and get docid meta tag*/
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.command && (msg.command == "getManager")) {
        var response = '';

        if (resObject) {
            response = resObject.id;
        }

        sendResponse(response);
    }
});