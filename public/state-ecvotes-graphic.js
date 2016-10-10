export default function setupECVotes() {
  // Interactivity for EC votes chart (state page)
  const ecVotesTooltip = document.querySelector('.state-ecvotes-graphic__tooltip');
  const originalsquares = document.querySelectorAll('.state-ecvotes-graphic__squares > div.current-state');
  let currentState;

  [...originalsquares].forEach(d => d.classList.add('state-ecvotes-graphic__square--ec-vote'));

  [...document.querySelectorAll('.state-ecvotes-graphic__squares > div')]
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

        [...document.querySelectorAll('.state-ecvotes-graphic__square--ec-vote')]
          .forEach(item => item.classList.remove('state-ecvotes-graphic__square--ec-vote'));
        [...states]
          .forEach(item => item.classList.add('state-ecvotes-graphic__square--ec-vote'));

        ecVotesTooltip.innerText = `${stateName}: ${states.length} vote${states.length ? 's' : ''}`;
        ecVotesTooltip.style.top = `${e.target.offsetTop - 20}px`;
        ecVotesTooltip.style.left = `${e.target.offsetLeft + 20}px`;
        ecVotesTooltip.style.position = 'absolute';
        ecVotesTooltip.style.display = 'block';
      }

      d.addEventListener('mouseover', selectStateHandler);

      d.addEventListener('mouseout', () => {
        [...document.querySelectorAll('.state-ecvotes-graphic__square--ec-vote')]
          .forEach(item => item.classList.remove('state-ecvotes-graphic__square--ec-vote'));
        [...originalsquares]
          .forEach(item => item.classList.add('state-ecvotes-graphic__square--ec-vote'));

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
