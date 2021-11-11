import { toMinutes } from "./helpers.js";
import { DEFAULT_TIMEOUT, MESSAGE } from "./settings.js";

const audio = new Audio(
  chrome.runtime.getURL("audio/goes-without-saying-608.mp3")
);
let intervalId;

chrome.runtime.onInstalled.addListener(async function () {
  await initDefaultTimeout();
  const timeout = await loadTimeout();
  intervalId = startNotifications(timeout);
});

chrome.runtime.onMessage.addListener(async function (message) {
  if (message === MESSAGE.REFRESH) {
    refreshNotifications();
    return;
  }
  throw `Handle for "${message}" not implemented`;
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

async function refreshNotifications() {
  console.log("refreshNotifications");
  clearInterval(intervalId);
  const timeout = await loadTimeout();
  intervalId = startNotifications(timeout);
}

function startNotifications(timeout) {
  console.log(`startNotifications ${toMinutes(timeout)}m`);
  return setInterval(() => {
    audio.play();
  }, timeout);
}
