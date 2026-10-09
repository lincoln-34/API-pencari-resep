console.log('==========================');
console.log('RECIPE FINDER - SKL 2');
console.log('==========================');

// 1. VARIABLE UTAMA (ARRAY NAMPUNG DATA)
let recipes = []; // nampung data resep dari API
let favorites = []; // nampung data resep favorit

// Ambil data favorit dari localStorage kalo ada
const savedFavorites = localStorage.getItem('favoriteRecipes');
if (savedFavorites) {
  favorites = JSON.parse(savedFavorites);
}

// 2. ELEMEN DOM DARI HTML
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const cuisineFilter = document.getElementById('cuisine-filter');
const difficultyFilter = document.getElementById('difficulty-filter');
const favoriteButton = document.getElementById('favorite-button');
const favoriteCount = document.getElementById('favorite-count');
const sectionTitle = document.getElementById('section-title');
const recipeCount = document.getElementById('recipe-count');
const resetFilterBtn = document.getElementById('reset-filter-button');

// Elemen State & Grid
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const emptyState = document.getElementById('empty-state');
const recipeGrid = document.getElementById('recipe-grid');

// Dialog / Modal
const recipeDialog = document.getElementById('recipe-dialog');
const dialogContent = document.getElementById('dialog-content');
const closeDialogBtn = document.getElementById('close-dialog');

// 3. UPDATE BADGE COUNTER FAVORIT
favoriteCount.innerText = favorites.length;

// 4. MENGAMBIL DATA DARI API DENGAN FETCH
fetch('https://dummyjson.com/recipes?limit=50')
  .then((res) => res.json())
  .then((data) => {
    recipes = data.recipes;
    console.log({ recipes });

    // Sembunyikan loading, munculkan grid
    loadingState.hidden = true;
    recipeGrid.hidden = false;

    // Masukkan pilihan cuisine ke dropdown
    generateCuisineOptions();

    // Tampilkan resep pertama kali
    generateRecipeList(recipes);
  })
  .catch((err) => {
    console.log('Error fetch data:', err);
    loadingState.hidden = true;
    errorState.hidden = false;
  });

// 5. ISI OPTION DROPDOWN CUISINE
function generateCuisineOptions() {
  let cuisines = [];

  for (let i = 0; i < recipes.length; i++) {
    const cuisine = recipes[i].cuisine;
    if (!cuisines.includes(cuisine)) {
      cuisines.push(cuisine);
    }
  }

  for (let i = 0; i < cuisines.length; i++) {
    cuisineFilter.innerHTML += `<option value="${cuisines[i]}">${cuisines[i]}</option>`;
  }
}

// 6. GENERATE TAMPILAN RESEP KE GRID
function generateRecipeList(dataResep) {
  recipeGrid.innerHTML = ''; // kosongkan dulu grid
  recipeCount.innerText = `${dataResep.length} recipes`;

  // Kalo data resep kosong
  if (dataResep.length === 0) {
    emptyState.hidden = false;
    recipeGrid.hidden = true;
    return;
  }

  emptyState.hidden = false;
  emptyState.hidden = true;
  recipeGrid.hidden = false;

  // Looping cetak resep
  for (let i = 0; i < dataResep.length; i++) {
    const recipe = dataResep[i];

    // Cek apakah resep ini ada di array favorit
    let isFav = false;
    for (let j = 0; j < favorites.length; j++) {
      if (favorites[j].id === recipe.id) {
        isFav = true;
        break;
      }
    }

    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

    recipeGrid.innerHTML += `
      <div class="recipe-card">
        <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
        <div class="recipe-body">
          <span class="recipe-cuisine">${recipe.cuisine}</span>
          <h3 class="recipe-title">${recipe.name}</h3>
          <div class="recipe-meta">
            <span>⏱️ ${totalTime} mins</span>
            <span>⭐ ${recipe.rating}</span>
            <span>📊 ${recipe.difficulty}</span>
          </div>
          <div class="recipe-actions">
            <button class="detail-button" type="button" onclick="showDetail(${recipe.id})">View Recipe</button>
            <button class="like-button" type="button" onclick="toggleFavorite(${recipe.id})">
              ${isFav ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

// 7. FILTER DAN PENCARIAN DATA
function filterData() {
  const keyword = searchInput.value.toLowerCase();
  const selectedCuisine = cuisineFilter.value;
  const selectedDifficulty = difficultyFilter.value;

  let hasilFilter = [];

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];

    const matchSearch = recipe.name.toLowerCase().includes(keyword);
    const matchCuisine = selectedCuisine === '' || recipe.cuisine === selectedCuisine;
    const matchDifficulty = selectedDifficulty === '' || recipe.difficulty === selectedDifficulty;

    if (matchSearch && matchCuisine && matchDifficulty) {
      hasilFilter.push(recipe);
    }
  }

  // Cek tombol reset
  if (keyword !== '' || selectedCuisine !== '' || selectedDifficulty !== '') {
    resetFilterBtn.hidden = false;
  } else {
    resetFilterBtn.hidden = true;
  }

  generateRecipeList(hasilFilter);
}

// 8. TAMBAH & HAPUS FAVORIT
function toggleFavorite(id) {
  let targetRecipe = null;

  for (let i = 0; i < recipes.length; i++) {
    if (recipes[i].id === id) {
      targetRecipe = recipes[i];
      break;
    }
  }

  let index = -1;
  for (let i = 0; i < favorites.length; i++) {
    if (favorites[i].id === id) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    // Kalo udah ada di favorit -> hapus
    favorites.splice(index, 1);
  } else {
    // Kalo belum ada -> tambah
    if (targetRecipe) {
      favorites.push(targetRecipe);
    }
  }

  // Simpan array favorites ke LocalStorage (diubah jadi string)
  localStorage.setItem('favoriteRecipes', JSON.stringify(favorites));

  // Update angka counter favorit
  favoriteCount.innerText = favorites.length;

  // Render ulang
  filterData();
}

// 9. TAMPILKAN MODAL DETAIL RESEP
function showDetail(id) {
  let recipe = null;

  for (let i = 0; i < recipes.length; i++) {
    if (recipes[i].id === id) {
      recipe = recipes[i];
      break;
    }
  }

  if (!recipe) return;

  // Susun daftar bahan baku
  let listBahan = '';
  for (let i = 0; i < recipe.ingredients.length; i++) {
    listBahan += `<li>${recipe.ingredients[i]}</li>`;
  }

  // Susun langkah-langkah
  let listLangkah = '';
  for (let i = 0; i < recipe.instructions.length; i++) {
    listLangkah += `<p>${recipe.instructions[i]}</p>`;
  }

  dialogContent.innerHTML = `
    <img src="${recipe.image}" alt="${recipe.name}" class="dialog-image">
    <div class="dialog-body">
      <h2>${recipe.name}</h2>
      <div class="dialog-meta">
        <span>🌍 ${recipe.cuisine}</span>
        <span>⏱️ Prep: ${recipe.prepTimeMinutes}m | Cook: ${recipe.cookTimeMinutes}m</span>
        <span>⭐ ${recipe.rating}</span>
        <span>🔥 ${recipe.caloriesPerServing} kcal</span>
      </div>

      <h3>Ingredients</h3>
      <ul class="ingredients">
        ${listBahan}
      </ul>

      <h3>Instructions</h3>
      <div class="instructions">
        ${listLangkah}
      </div>
    </div>
  `;

  recipeDialog.showModal();
}

closeDialogBtn.addEventListener('click', () => {
  recipeDialog.close();
});

// 10. EVENT LISTENERS FORM & FILTER
searchForm.addEventListener('submit', (e) => {
  e.preventDefault(); // Mencegah form reload page
  filterData();
});

searchInput.addEventListener('input', filterData);
cuisineFilter.addEventListener('change', filterData);
difficultyFilter.addEventListener('change', filterData);

// Klik tombol Favorit di Header
favoriteButton.addEventListener('click', () => {
  sectionTitle.innerText = 'Favorite Recipes';
  generateRecipeList(favorites);
});

// Klik tombol Reset Filter
resetFilterBtn.addEventListener('click', () => {
  searchInput.value = '';
  cuisineFilter.value = '';
  difficultyFilter.value = '';
  resetFilterBtn.hidden = true;
  sectionTitle.innerText = 'Explore Recipes';
  generateRecipeList(recipes);
});