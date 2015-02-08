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
      command: "getResource"      
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

        //chrome.browserAction.setIcon ({path: 'images/icon128.png'});
        chrome.tabs.create({
            url: newUrl,
            index: tabIndex + 1
        }); 
    });
});