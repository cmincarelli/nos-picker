import { NosPicker } from './app';
import { NosPickerEvents } from './events';

const events = new NosPickerEvents();
const npa = new NosPicker(events);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('foreground message', request);

  switch (request.action) {
    case 'start':
      npa.createAppWindow(parseInt(request.mode));
      break;
    case 'stop':
      npa.destroyAppWindow();
      break;
  }
  sendResponse({ ...request, hasStarted: npa.hasStarted, mode: npa.pickerMode, state: npa.pickerState });
  return true;
});