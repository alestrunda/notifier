import {
  createOptionElement,
  loadFromStorage,
  toMilliseconds,
  toMinutes,
} from "./helpers.js";
import { AUDIO_FILES, MESSAGE, STORAGE_KEYS } from "./settings.js";

const submitButton = document.getElementById("submit");
const audioSelect = document.getElementById("audio");
const timeoutInput = document.getElementById("timeout");
const volumeInput = document.getElementById("volume");
const outputElement = document.getElementById("output");
const remainingElement = document.getElementById("remaining");

(async function main() {
  setInputValues();
  initAudioSelect();
  const remainingTime = await loadFromStorage(STORAGE_KEYS.remainingTime);
  showRemainingTime(remainingTime);
})();

// handle submit
submitButton.onclick = function () {
  const audioFile = audioSelect.value;
  const timeout = toMilliseconds(timeoutInput.value);
  const volume = volumeInput.value;

  chrome.storage.sync.set(
    {
      [STORAGE_KEYS.STORAGE_KEYS]: audioFile,
      [STORAGE_KEYS.remainingTime]: timeout,
      [STORAGE_KEYS.timeout]: timeout,
      [STORAGE_KEYS.volume]: volume,
    },
    function () {
      showUserMessage(
        `Timeout set to ${toMinutes(
          timeout
        )} minutes.<br />Volume se to ${volume}.<br />Audio set to "${
          AUDIO_FILES[audioFile]
        }".`
      );
      showRemainingTime(timeout);
      chrome.runtime.sendMessage(undefined, MESSAGE.refresh);
    }
  );
};

async function setInputValues() {
  const audioFile = await loadFromStorage(STORAGE_KEYS.audioFile);
  const timeout = await loadFromStorage(STORAGE_KEYS.timeout);
  const volume = await loadFromStorage(STORAGE_KEYS.volume);
  audioSelect.value = audioFile;
  timeoutInput.value = toMinutes(timeout);
  volumeInput.value = volume;
}

function initAudioSelect() {
  Object.keys(AUDIO_FILES).forEach((key) => {
    const option = createOptionElement(key, AUDIO_FILES[key]);
    audioSelect.appendChild(option);
  });
}

function showUserMessage(message) {
  outputElement.classList.remove("d-none");
  outputElement.innerHTML = message;
}

function showRemainingTime(timeout) {
  remainingElement.innerHTML = `Next notification in: ${toMinutes(
    timeout
  )} minutes`;
}
