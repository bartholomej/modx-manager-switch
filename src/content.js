const META_NAME = 'queeg';
const meta = document.querySelector(`meta[name='${META_NAME}']`);
let sysObject = null;

if (meta) {
  const resData = meta.getAttribute('content');
  const sysData = meta.getAttribute('data-system');

  if (resData && sysData) {
    const resObject = JSON.parse(resData);
    sysObject = JSON.parse(sysData);

    resObject.system = false;
    sysObject.system = true;

    chrome.runtime.sendMessage(resObject);
    chrome.runtime.sendMessage(sysObject);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(sysObject);
  if (msg.command && msg.command === 'getManager') {
    sendResponse(sysObject || '');
  }
});
