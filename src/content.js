const META_NAME = 'queeg';
const meta = document.querySelector(`meta[name='${META_NAME}']`);

if (meta) {
  const resData = meta.getAttribute('content');
  const sysData = meta.getAttribute('data-system');

  if (resData && sysData) {
    const resObject = JSON.parse(resData);
    const sysObject = JSON.parse(sysData);

    resObject.system = false;
    sysObject.system = true;

    chrome.runtime.sendMessage(resObject);
    chrome.runtime.sendMessage(sysObject);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.command && msg.command === 'getManager') {
    sendResponse(sysObject || '');
  }
});
