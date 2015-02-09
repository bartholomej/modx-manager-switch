/* Listen for messages and get modResource meta tag*/
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.command && (msg.command == "getResource")) {

    function getMetaContentByName(name,content){
        var content = (content==null)?'content':content;
        var meta = document.querySelector("meta[name='" + name + "']");
        if (meta) {
            return meta.getAttribute(content); 
        }       
    }    
    sendResponse(getMetaContentByName('application-name','data-id'));
  }
});