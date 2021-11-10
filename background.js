const DEFAULT_TIMEOUT = 1800000; // 30 minutes

const audio = new Audio(
  chrome.runtime.getURL("audio/goes-without-saying-608.mp3")
);

chrome.runtime.onInstalled.addListener(async function () {
  await initDefaultTimeout();
  const timeout = await loadTimeout();
  startNotifications(timeout);
});

function initDefaultTimeout() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["timeout"], function (res) {
      if (!res.timeout) {
        chrome.storage.sync.set({ timeout: DEFAULT_TIMEOUT }, function () {
          console.log(`Default timeout set: ${DEFAULT_TIMEOUT}ms.`);
          resolve(DEFAULT_TIMEOUT);
        });
      } else {
        resolve(res.timeout);
      }
    });
  });
}

function loadTimeout() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["timeout"], function (res) {
      resolve(res.timeout);
    });
  });
}

function startNotifications(timeout) {
  return setInterval(() => {
    audio.play();
  }, timeout);
}
