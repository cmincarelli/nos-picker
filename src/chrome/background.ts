if ('undefined' !== typeof chrome) {
  const reload = () => {
    chrome.tabs.query({ url: ['http://*/*', 'https://*/*', ] }, function(tabs) {
      for (let i = 0; i < tabs.length; i++) {
          chrome.tabs.reload(<number>(tabs[i].id));
      }
    });
  }

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      //chrome.tabs.executeScript(tabId, { file: 'chrome/vendor/jquery-3.2.1.min.js' }, function () {
      //    console.log('version', jQuery.fn.jquery);
      //});
  });

  chrome.runtime.onInstalled.addListener ( (details) => {
    if (details.reason === 'update' || details.reason === 'install') {
      reload();
    }
  });

  chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    console.log('background message', request);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(<number>(tabs[0].id), request, (response: object) => {
          sendResponse(response);
        });
    });
    return true;
  });
}
