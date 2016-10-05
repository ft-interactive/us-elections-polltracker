export default function setupECVotes() {
  // Interactivity for EC votes chart (state page)
  const ecVotesTooltip = document.querySelector('.graphic__ecvotes--label');
  const originalCircles = document.querySelectorAll('.graphic__ecvotes--circles .circle.current-state');
  let currentState;

  [...originalCircles].forEach(d => d.classList.add('ec-vote'));

  [...document.querySelectorAll('.graphic__ecvotes--circles .circle')]
    .forEach(d => {
      function selectStateHandler(e) {
        if (('ontouchstart' in window) ||
          (navigator.maxTouchPoints > 0) ||
          (navigator.msMaxTouchPoints > 0)) {
            return;
        }
        const parent = e.target.parentNode;
        const stateAbbr = parent.dataset.state || e.target.dataset.state;
        const stateName = parent.dataset.stateName || e.target.dataset.stateName;
        const states = document.querySelectorAll(`[data-state="${stateAbbr}"]`);

        [...document.querySelectorAll('.graphic__ecvotes--circles .circle.ec-vote')]
          .forEach(item => item.classList.remove('ec-vote'));
        [...states]
          .forEach(item => item.classList.add('ec-vote'));

        ecVotesTooltip.innerText = `${stateName}: ${states.length} vote${states.length > 1 ? 's' : ''}`;
        ecVotesTooltip.style.top = `${e.target.offsetTop - 20}px`;
        ecVotesTooltip.style.left = `${e.target.offsetLeft + 20}px`;
        ecVotesTooltip.style.position = 'absolute';
        ecVotesTooltip.style.display = 'block';
      }

      d.addEventListener('mouseover', selectStateHandler);

      d.addEventListener('mouseout', () => {
        [...document.querySelectorAll('.graphic__ecvotes--circles .circle.ec-vote')]
          .forEach(item => item.classList.remove('ec-vote'));
        [...originalCircles]
          .forEach(item => item.classList.add('ec-vote'));

        ecVotesTooltip.innerText = '';
        ecVotesTooltip.style.display = 'none';
      });

      d.addEventListener('click', e => {
        const stateAbbr = e.target.parentNode.dataset.state || e.target.dataset.state;
        if (('ontouchstart' in window) ||
          (navigator.maxTouchPoints > 0) ||
          (navigator.msMaxTouchPoints > 0)) {
          return;
        } else {
          window.location.href = `${stateAbbr}-polls`;
        }
      });
    });
}
