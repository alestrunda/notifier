import { createOptionElement, toMilliseconds, toMinutes } from "./helpers.js";
import { AUDIO_FILES, MESSAGE, STORAGE_KEYS } from "./settings.js";

const submitButton = document.getElementById("submit");
const audioSelect = document.getElementById("audio");
const timeoutInput = document.getElementById("timeout");
const outputElement = document.getElementById("output");

(function initAudioSelect() {
  Object.keys(AUDIO_FILES).forEach((key) => {
    const option = createOptionElement(key, AUDIO_FILES[key]);
    audioSelect.appendChild(option);
  });
})();

// load last values from storage
chrome.storage.sync.get(
  [STORAGE_KEYS.audioFile, STORAGE_KEYS.timeout],
  function (res) {
    audioSelect.value = res.audioFile;
    timeoutInput.value = toMinutes(res.timeout);
  }
);

// handle submit
submitButton.onclick = function () {
  const audioFile = audioSelect.value;
  const timeout = toMilliseconds(timeoutInput.value);

  chrome.storage.sync.set({ audioFile, timeout }, function () {
    outputElement.innerHTML = `Timeout set to ${toMinutes(
      timeout
    )}m.\nAudio set to "${AUDIO_FILES[audioFile]}"`;
    chrome.runtime.sendMessage(undefined, MESSAGE.refresh);
  });
};
