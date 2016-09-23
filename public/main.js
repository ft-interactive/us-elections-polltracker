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

  // Interactivity for EC votes chart (state page)
  const ecVotesTooltip = document.querySelector('.graphic__ecvotes--label');
  const originalCircles = document.querySelectorAll('.graphic__ecvotes--circles .circle.ec-vote');
  [...document.querySelectorAll('.graphic__ecvotes--circles .circle')]
    .forEach(d => {
      d.addEventListener('mouseover', e => {
        const parent = e.target.parentNode;
        const stateAbbr = parent.dataset.state || e.target.dataset.state;
        const states = document.querySelectorAll(`[data-state="${stateAbbr}"]`);

        [...document.querySelectorAll('.graphic__ecvotes--circles .circle.ec-vote')]
          .forEach(item => item.classList.remove('ec-vote'));
        [...states]
          .forEach(item => item.classList.add('ec-vote'));

        ecVotesTooltip.innerText = `${stateAbbr}: ${states.length} vote${states.length > 1 ? 's' : ''}`;
        ecVotesTooltip.style.top = `${e.target.offsetTop - 20}px`;
        ecVotesTooltip.style.left = `${e.target.offsetLeft + 20}px`;
        ecVotesTooltip.style.position = 'absolute';
        ecVotesTooltip.style.display = 'block';
      });

      d.addEventListener('mouseout', () => {
        [...document.querySelectorAll('.graphic__ecvotes--circles .circle.ec-vote')]
          .forEach(item => item.classList.remove('ec-vote'));
        [...originalCircles]
          .forEach(item => item.classList.add('ec-vote'));

        ecVotesTooltip.innerText = '';
        ecVotesTooltip.style.display = 'none';
      });

      d.addEventListener('click', (e) => {
        const stateAbbr = e.target.parentNode.dataset.state || e.target.dataset.state;
        window.location.href = `${stateAbbr}-polls`;
      });
    });
}());
