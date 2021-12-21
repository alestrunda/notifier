export function toMinutes(milliseconds) {
  return Math.ceil(milliseconds / 60 / 1000);
}

export function toMilliseconds(minutes) {
  return minutes * 60 * 1000;
}

export function createAudioElement(filename, volume = 100) {
  const audio = new Audio(chrome.runtime.getURL(`audio/${filename}`));
  audio.volume = volume / 100;
  return audio;
}

export function createOptionElement(value, name) {
  const option = document.createElement("option");
  option.value = value;
  option.innerHTML = name;
  return option;
}

export function loadFromStorage(key) {
  return new Promise((resolve) => {
    chrome.storage.sync.get(key, function (res) {
      resolve(res[key]);
    });
  });
}

export function saveToStorage(key, value) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ [key]: value }, function () {
      resolve();
    });
  });
}
