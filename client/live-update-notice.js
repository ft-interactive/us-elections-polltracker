export default () => {
  if (location.href.indexOf('hide-notice') !== -1) return;

  const liveUpdateNotice = document.querySelector('.live-update-notice');
  const button = liveUpdateNotice.querySelector('.live-update-notice__dismiss');

  const key = 'ig-results-live-update-notice-dismissed';

  const hasLocalStorage = (() => {
    // feature detect taken from modernizr
    const mod = 'x';
    try {
      localStorage.setItem(mod, mod);
      localStorage.removeItem(mod);
      return true;
    } catch (e) {
      return false;
    }
  })();

  if (hasLocalStorage && localStorage.getItem(key)) {
    liveUpdateNotice.remove();
  } else {
    button.addEventListener('click', () => {
      liveUpdateNotice.remove();

      if (localStorage) {
        localStorage.setItem(key, true);
      }
    });

    liveUpdateNotice.classList.add('live-update-notice--js');
  }
};
