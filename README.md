# Notifier

Simple Chrome extension to periodically play notification sound.

## How to install it?

Clone this repo. In Chrome navigate to the extenstions page `chrome://extensions/` and click button `Load unpacked` (make sure you have *Developer mode* on otherwise the button will be hidden) and select this folder.

To change the settings go to the "Details" of the extension and click on the "Extension options" link.

## How to add your own sound

Add it to `AUDIO_FILES` in `setting.js` and it will be available to select in the "Details" page. Then also add it in `manifest.json` in `web_accessible_resources` so give the extension permission to load the file.

## Credits

Sounds from [Notification Sounds](https://notificationsounds.com/).
