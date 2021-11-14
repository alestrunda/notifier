import {
  createOptionElement,
  loadFromStorage,
  toMilliseconds,
  toMinutes,
} from "./helpers.js";
import {
  AUDIO_FILES,
  MESSAGE,
  REMAINING_TIME_REFRESH_INTERVAL,
  STORAGE_KEYS,
} from "./settings.js";

const submitButton = document.getElementById("submit");
const audioSelect = document.getElementById("audio");
const timeoutInput = document.getElementById("timeout");
const outputElement = document.getElementById("output");
const remainingElement = document.getElementById("remaining");

(function main() {
  setInputValues();
  initAudioSelect();
  trackRemainingTime();
})();

// handle submit
submitButton.onclick = function () {
  const audioFile = audioSelect.value;
  const timeout = toMilliseconds(timeoutInput.value);

  chrome.storage.sync.set(
    {
      [STORAGE_KEYS.STORAGE_KEYS]: audioFile,
      [STORAGE_KEYS.remainingTime]: timeout,
      [STORAGE_KEYS.timeout]: timeout,
    },
    function () {
      showUserMessage(
        `Timeout set to ${toMinutes(timeout)}m.<br />Audio set to "${
          AUDIO_FILES[audioFile]
        }".`
      );
      showRemainingTime(timeout);
      chrome.runtime.sendMessage(undefined, MESSAGE.refresh);
    }
  );
};

async function setInputValues() {
  const timeout = await loadFromStorage(STORAGE_KEYS.timeout);
  const audioFile = await loadFromStorage(STORAGE_KEYS.audioFile);
  audioSelect.value = audioFile;
  timeoutInput.value = toMinutes(timeout);
}

async function trackRemainingTime() {
  let remainingTime = await loadFromStorage(STORAGE_KEYS.remainingTime);
  showRemainingTime(remainingTime);
  setInterval(async () => {
    remainingTime = await loadFromStorage(STORAGE_KEYS.remainingTime);
    showRemainingTime(remainingTime);
  }, REMAINING_TIME_REFRESH_INTERVAL);
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
