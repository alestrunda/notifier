import {
  createAudioElement,
  loadFromStorage,
  saveToStorage,
  setVolume,
  toMinutes,
} from "./helpers.js";
import {
  AUDIO_FILES,
  DEFAULT_TIMEOUT,
  DEFAULT_VOLUME,
  MESSAGE,
  REMAINING_TIME_REFRESH_INTERVAL,
  STORAGE_KEYS,
} from "./settings.js";

let audioElement = createAudioElement(Object.keys(AUDIO_FILES)[0]);
let notificationsIntervalId;
let remainingTimeIntervalId;

chrome.runtime.onInstalled.addListener(async function () {
  await setDefaults();
  await start();
});

chrome.runtime.onStartup.addListener(async function () {
  await start();
});

chrome.runtime.onMessage.addListener(async function (message) {
  if (message === MESSAGE.refresh) {
    await refreshNotifications();
    return;
  }
  throw `Handler for "${message}" not implemented`;
});

async function start() {
  const timeout = await loadFromStorage(STORAGE_KEYS.timeout);
  const volume = await loadFromStorage(STORAGE_KEYS.volume);
  setVolume(audioElement, volume);
  notificationsIntervalId = startNotifications(timeout);
  remainingTimeIntervalId = await trackRemainingTime();
}

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
        [STORAGE_KEYS.volume]: DEFAULT_VOLUME,
      },
      function () {
        console.log(
          `Defaults set: ${audioFile}, ${DEFAULT_VOLUME}%, ${toMinutes(
            DEFAULT_TIMEOUT
          )}m.`
        );
        resolve();
      }
    );
  });
}

async function refreshNotifications() {
  console.log("refreshNotifications");
  clearInterval(notificationsIntervalId);
  clearInterval(remainingTimeIntervalId);
  const audioFile = await loadFromStorage(STORAGE_KEYS.audioFile);
  const timeout = await loadFromStorage(STORAGE_KEYS.timeout);
  const volume = await loadFromStorage(STORAGE_KEYS.volume);
  audioElement = createAudioElement(audioFile, volume);
  notificationsIntervalId = startNotifications(timeout);
  remainingTimeIntervalId = await trackRemainingTime();
}

async function trackRemainingTime() {
  let remainingTime =
    (await loadFromStorage(STORAGE_KEYS.timeout)) -
    REMAINING_TIME_REFRESH_INTERVAL;
  saveToStorage(STORAGE_KEYS.remainingTime, remainingTime);
  return setInterval(async () => {
    if (remainingTime === 0) {
      remainingTime = await loadFromStorage(STORAGE_KEYS.timeout);
    }
    remainingTime -= REMAINING_TIME_REFRESH_INTERVAL;
    saveToStorage(STORAGE_KEYS.remainingTime, remainingTime);
  }, REMAINING_TIME_REFRESH_INTERVAL);
}

function startNotifications(timeout) {
  console.log(`startNotifications ${toMinutes(timeout)}m`);
  return setInterval(() => {
    audioElement.play();
  }, timeout);
}
