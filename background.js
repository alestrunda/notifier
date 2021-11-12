import { createAudioElement, toMinutes } from "./helpers.js";
import {
  AUDIO_FILES,
  DEFAULT_TIMEOUT,
  MESSAGE,
  STORAGE_KEYS,
} from "./settings.js";

let audioElement = createAudioElement(Object.keys(AUDIO_FILES)[0]);
let intervalId;

chrome.runtime.onInstalled.addListener(async function () {
  await setDefaults();
  const timeout = await loadFromStorage(STORAGE_KEYS.timeout);
  intervalId = startNotifications(timeout);
});

chrome.runtime.onMessage.addListener(function (message) {
  if (message === MESSAGE.refresh) {
    refreshNotifications();
    return;
  }
  throw `Handler for "${message}" not implemented`;
});

function setDefaults() {
  const audioFile = Object.keys(AUDIO_FILES)[0];
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      [STORAGE_KEYS.audioFile, STORAGE_KEYS.timeout],
      function (res) {
        if (res.timeout) {
          resolve();
        }
        chrome.storage.sync.set(
          {
            audioFile,
            timeout: DEFAULT_TIMEOUT,
          },
          function () {
            console.log(
              `Defaults set: ${toMinutes(audioFile)}, ${DEFAULT_TIMEOUT}ms.`
            );
            resolve();
          }
        );
      }
    );
  });
}

function loadFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, function (res) {
      resolve(res[key]);
    });
  });
}

async function refreshNotifications() {
  console.log("refreshNotifications");
  clearInterval(intervalId);
  const audioFile = await loadFromStorage(STORAGE_KEYS.audioFile);
  const timeout = await loadFromStorage(STORAGE_KEYS.timeout);
  audioElement = createAudioElement(audioFile);
  intervalId = startNotifications(timeout);
}

function startNotifications(timeout) {
  console.log(`startNotifications ${toMinutes(timeout)}m`);
  return setInterval(() => {
    audioElement.play();
  }, timeout);
}
