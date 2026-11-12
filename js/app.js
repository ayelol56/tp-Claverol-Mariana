const API_BASE_URL = 'https://rickandmortyapi.com/api/episode';
const FILTER_PARAM_NAME = 'episode';
const STORAGE_KEY = 'tp_last_search';

const searchForm = document.querySelector('#search-form');
const inputName = document.querySelector('#input-name');
const inputFilter = document.querySelector('#input-filter');
const btnSearch = document.querySelector('#btn-search');
const statusMessage = document.querySelector('#status-message');
const resultsGrid = document.querySelector('#results-grid');

const fetchApiData = async (name, filter) => {
  const url = new URL(API_BASE_URL);
  
  if (name) url.searchParams.append('name', name);
  if (filter) url.searchParams.append(FILTER_PARAM_NAME, filter);

  const response = await fetch(url);

  // Tratar 404 como "sin resultados" (R7)
  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error('Error al conectar con la API');
  }
  const data = await response.json();
  return data.results || [];
};

const formatValue = (val) => {
  if (!val || val === 'unknown') return 'Desconocido';
  return val;
};

const createCard = (item) => {
    const card = document.createElement('article');
    card.className = 'card';

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = formatValue(item.name);

    const code = document.createElement('p');
    code.className = 'card-info';
    code.textContent = `Código: ${formatValue(item.episode)}`;

    const airDate = document.createElement('p');
    airDate.className = 'card-info';
    airDate.textContent = `Emisión: ${formatValue(item.air_date)}`;

    const characters = document.createElement('p');
  characters.className = 'card-info';
  characters.textContent = `Personajes: ${item.characters ? item.characters.length : 0}`;

  cardBody.append(title, code, airDate, characters);
  card.appendChild(cardBody);

  return card;
};

const renderResults = (results) => {
  resultsGrid.innerHTML = '';
  if (results.length === 0) {
    statusMessage.textContent = 'No se encontraron resultados para la búsqueda.';
    return;
  }
  statusMessage.textContent = '';
  const fragment = document.createDocumentFragment();
  results.forEach(item => {
    fragment.appendChild(createCard(item));
  });
  resultsGrid.appendChild(fragment);
};

// Guardar y recuperar de localStorage (R8)
const saveSearchToStorage = (name, filter) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, filter }));
};

const loadSearchFromStorage = () => {
  const rawData = localStorage.getItem(STORAGE_KEY);
  if (!rawData) return null;
  try {
    return JSON.parse(rawData);
  } catch {
    return null;
  }
};

const handleSearch = async (name, filter) => {
  if (!name.trim() && !filter.trim()) {
    statusMessage.textContent = 'Por favor, ingresa al menos un criterio de búsqueda.';
    resultsGrid.innerHTML = '';
    return;
  }

  btnSearch.disabled = true;
  statusMessage.textContent = 'Buscando…';
  resultsGrid.innerHTML = '';

  try {
    const results = await fetchApiData(name.trim(), filter.trim());
    renderResults(results);
    saveSearchToStorage(name.trim(), filter.trim());
  } catch (error) {
    statusMessage.textContent = 'Ocurrió un error al realizar la búsqueda. Revisa tu conexión.';
  } finally {
    btnSearch.disabled = false;
  }
};

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  handleSearch(inputName.value, inputFilter.value);
});

window.addEventListener('DOMContentLoaded', () => {
  const lastSearch = loadSearchFromStorage();
  if (lastSearch) {
    inputName.value = lastSearch.name || '';
    inputFilter.value = lastSearch.filter || '';
    handleSearch(lastSearch.name || '', lastSearch.filter || '');
  }
});