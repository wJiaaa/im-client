/*
 * @Author: wJiaaa
 * @LastEditors: wJiaaa
 */
import Notify from '@wcjiang/notify';
const notify = new Notify({
  effect: 'flash', // flash | scroll, Flashing or scrolling
  onclick: () => {
    // Click on the pop-up window trip event
    // Programmatically closes a notification.
    notify.close();
    notify.setTitle('iM');
  },
  // Title flashing, or scrolling speed
  interval: 1000,
  disableFavicon: true, // Optional, default false, if true, No longer overwrites the original favicon
  // Optional chrome browser notifications，
  // The default is not to fill in the following content
  notification: {
    title: 'iM通知!', // Set notification title
    icon: '' // Set notification icon, The default is Favicon
  }
});
export default notify;
