var META_NAME = 'application-name';
var APP_NAME = 'modxchromemanager';

var meta = document.querySelector("meta[name='" + META_NAME + "'][content='" + APP_NAME + "']");
var docid,
    published,
    editedon,
    editedby;

if (meta) {
    docid = meta.getAttribute('data-id');
    published = meta.getAttribute('data-published'),
    editedon = meta.getAttribute('data-editedon'),
    editedby = meta.getAttribute('data-editedby');

    chrome.runtime.sendMessage({
        "docid": docid,
        "published": published,
        "editedon": editedon,
        "editedby": editedby,
    });
}

/* Listen for messages and get docid meta tag*/
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.command && (msg.command == "getManager")) {
            sendResponse(docid);
    }    
});