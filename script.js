const searchInput = document.getElementById('search');
const filterButtons = document.querySelectorAll('.filter');
const placeCards = document.querySelectorAll('.place-card');
const emptyMessage = document.getElementById('empty');

let activeCategory = 'Todos';

function updatePlaces() {
  const term = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  placeCards.forEach(card => {
    const category = card.dataset.category;
    const searchable = (card.dataset.search + ' ' + card.innerText).toLowerCase();
    const matchesCategory = activeCategory === 'Todos' || category === activeCategory;
    const matchesSearch = searchable.includes(term);
    const visible = matchesCategory && matchesSearch;

    card.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });

  emptyMessage.style.display = visibleCount === 0 ? 'block' : 'none';
}

searchInput.addEventListener('input', updatePlaces);

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    filterButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    updatePlaces();
  });
});
