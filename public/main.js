/**
 * Site main frontendian code
 */

/* eslint-disable no-var,vars-on-top */

(function main() {
  var overlay = document.createElement('div');
  var aside = document.querySelector('.article__aside');
  var backButton = document.querySelector('.nav___mobile-nav:not(.page__national) .nav___mobile-nav--back-to-overview');
  var startX;
  var startY;
  var dist;
  var threshold = 150; // required min distance traveled to be considered swipe
  var allowedTime = 200; // maximum time allowed to travel that distance
  var elapsedTime;
  var startTime;

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

  aside.addEventListener('touchstart', menuSwipeStart, false);
  aside.addEventListener('touchend', menuSwipeEnd, false);

  if (backButton) {
    backButton.addEventListener('click', goHome);
  }

  document.querySelector('.nav___mobile-nav--choose-state')
    .addEventListener('click', toggleMenu);

  document.querySelector('.rail__close-button--button')
    .addEventListener('click', closeMenu);
}());
