import {
  createAudioElement,
  loadFromStorage,
  saveToStorage,
  toMinutes,
} from "./helpers.js";
import {
  AUDIO_FILES,
  DEFAULT_TIMEOUT,
  MESSAGE,
  REMAINING_TIME_REFRESH_INTERVAL,
  STORAGE_KEYS,
} from "./settings.js";

let audioElement = createAudioElement(Object.keys(AUDIO_FILES)[0]);
let notificationsIntervalId;

chrome.runtime.onInstalled.addListener(async function () {
  await setDefaults();
  const timeout = await loadFromStorage(STORAGE_KEYS.timeout);
  notificationsIntervalId = startNotifications(timeout);
  trackRemainingTime();
});

chrome.runtime.onStartup.addListener(async function () {
  const timeout = await loadFromStorage(STORAGE_KEYS.timeout);
  notificationsIntervalId = startNotifications(timeout);
  trackRemainingTime();
});

chrome.runtime.onMessage.addListener(function (message) {
  if (message === MESSAGE.refresh) {
    refreshNotifications();
    return;
  }
  throw `Handler for "${message}" not implemented`;
});

async function setDefaults() {
  const audioFile = Object.keys(AUDIO_FILES)[0];
  const timeout = await loadFromStorage(STORAGE_KEYS.timeout);
  return new Promise((resolve) => {
    if (timeout !== undefined) {
      // defaults already set, nothing to do
      resolve();
    }
    chrome.storage.sync.set(
      {
        [STORAGE_KEYS.audioFile]: audioFile,
        [STORAGE_KEYS.remainingTime]: DEFAULT_TIMEOUT,
        [STORAGE_KEYS.timeout]: DEFAULT_TIMEOUT,
      },
      function () {
        console.log(
          `Defaults set: ${audioFile}, ${toMinutes(DEFAULT_TIMEOUT)}m.`
        );
        resolve();
      }
    );
  });
}

async function refreshNotifications() {
  console.log("refreshNotifications");
  clearInterval(notificationsIntervalId);
  const audioFile = await loadFromStorage(STORAGE_KEYS.audioFile);
  const timeout = await loadFromStorage(STORAGE_KEYS.timeout);
  audioElement = createAudioElement(audioFile);
  notificationsIntervalId = startNotifications(timeout);
}

function trackRemainingTime() {
  return setInterval(async () => {
    let remainingTime = await loadFromStorage(STORAGE_KEYS.remainingTime);
    if (remainingTime < 0) {
      remainingTime = await loadFromStorage(STORAGE_KEYS.timeout);
    } else {
      remainingTime -= REMAINING_TIME_REFRESH_INTERVAL;
    }
    saveToStorage(STORAGE_KEYS.remainingTime, remainingTime);
  }, REMAINING_TIME_REFRESH_INTERVAL);
}

function startNotifications(timeout) {
  console.log(`startNotifications ${toMinutes(timeout)}m`);
  return setInterval(() => {
    audioElement.play();
  }, timeout);
}
