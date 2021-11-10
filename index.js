const timeoutButton = document.getElementById("timeoutButton");
const timeoutInput = document.getElementById("timeoutInput");
const output = document.getElementById("output");

// load last "timeout" value from storage
chrome.storage.sync.get(["timeout"], function (res) {
  timeoutInput.value = toMinutes(res.timeout);
});

// set "timeout" value
timeoutButton.onclick = function () {
  const timeout = toMilliseconds(timeoutInput.value);

  chrome.storage.sync.set({ timeout }, function () {
    console.log(`Timeout set: ${timeout}ms.`);
    output.innerHTML = `Timeout updated to ${toMinutes(timeout)}m.`;
  });
};

function toMinutes(milliseconds) {
  return milliseconds / 60 / 1000;
}

function toMilliseconds(milliseconds) {
  return milliseconds * 60 * 1000;
}