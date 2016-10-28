export default function setupMobileNav() {
  const overlay = document.createElement('div');
  const aside = document.querySelector('.article__aside');
  const backButton = document.querySelector('.nav___mobile-nav:not(.page__national) .nav___mobile-nav--back-to-overview');
  const chooseStateButton = document.querySelector('.nav___mobile-nav--choose-state');
  const closeMobileNavButton = document.querySelector('.rail__close-button--button');
  const threshold = 150; // required min distance traveled to be considered swipe
  const allowedTime = 200; // maximum time allowed to travel that distance
  let elapsedTime;
  let startTime;
  let startX;
  let startY;
  let dist;

  function toggleMenu() {
    aside.classList.toggle('opened');
    overlay.classList.toggle('opened');
  }

  function goHome() {
    window.location.href = 'polls';
  }

  function closeMenu() {
    aside.classList.remove('opened');
    overlay.classList.remove('opened');
  }

  function handleswipe(isrightswipe) {
    if (isrightswipe) closeMenu();
  }

  function menuSwipeStart(e) {
    var touchobj = e.changedTouches[0];
    dist = 0;
    startX = touchobj.pageX;
    startY = touchobj.pageY;
    startTime = new Date().getTime();
  }

  function menuSwipeEnd(e) {
    var touchobj = e.changedTouches[0];
    dist = touchobj.pageX - startX;
    elapsedTime = new Date().getTime() - startTime; // get time elapsed

    // check that elapsed time is within specified, horizontal dist traveled >= threshold, and vertical dist traveled <= 100
    var swiperightBol = (elapsedTime <= allowedTime && dist >= threshold && Math.abs(touchobj.pageY - startY) <= 100);
    handleswipe(swiperightBol);
  }

  overlay.classList.add('rail__mobile-overlay');
  overlay.addEventListener('click', closeMenu);
  document.body.appendChild(overlay);

  try {
    aside.addEventListener('touchstart', menuSwipeStart, false);
    aside.addEventListener('touchend', menuSwipeEnd, false);
    chooseStateButton.addEventListener('click', toggleMenu);
    closeMobileNavButton.addEventListener('click', closeMenu);

    if (backButton) {
      backButton.addEventListener('click', goHome);
    }
  } catch(e) {
    console.error(e)
  }
}
