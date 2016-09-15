(function main() {
  function toggleMenu() {
    document.querySelector('.article__aside').classList.toggle('opened');
    document.querySelector('.button__show-nav .o-icons-icon').classList.toggle('o-icons-icon--arrow-up');
    document.querySelector('.button__show-nav .o-icons-icon').classList.toggle('o-icons-icon--arrow-down');
  }

  document.querySelector('.button__show-nav').addEventListener('click', toggleMenu);
}());
