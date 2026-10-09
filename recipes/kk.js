console.log('=========================='); 
console.log('RECIPE FINDER - SKL 2'); 
console.log('=========================='); 

// tempat nyimpen data
let recipes = []; // wadah kosong buat nampung semua resep dari internet
let favorites = []; // wadah kosong buat nampung resep yang kamu suka


const savedFavorites = localStorage.getItem('favoriteRecipes'); // intip resep favorit di memori
if (savedFavorites) { // kalau ada resep yang pernah disimpen
  favorites = JSON.parse(savedFavorites); // ubah tulisan memori jadi data resep lagi
}


const searchForm = document.getElementById('search-form'); // ambil formulir pencarian
const searchInput = document.getElementById('search-input'); // ambil kotak ketik pencarian
const cuisineFilter = document.getElementById('cuisine-filter'); // ambil pilihan asal negara
const difficultyFilter = document.getElementById('difficulty-filter'); // ambil pilihan tingkat kesulitan
const favoriteButton = document.getElementById('favorite-button'); // ambil tombol favorit di atas
const favoriteCount = document.getElementById('favorite-count'); // ambil angka penanda favorit
const sectionTitle = document.getElementById('section-title'); // ambil judul bagian utama
const recipeCount = document.getElementById('recipe-count'); // ambil tulisan jumlah resep
const resetFilterBtn = document.getElementById('reset-filter-button'); // ambil tombol ulang pencarian


const loadingState = document.getElementById('loading-state'); // ambil tampilan lagi proses
const errorState = document.getElementById('error-state'); // ambil tampilan lagi gawat/rusak
const emptyState = document.getElementById('empty-state'); // ambil tampilan kalau resep gak ada
const recipeGrid = document.getElementById('recipe-grid'); // ambil papan tempat naro kartu resep


const recipeDialog = document.getElementById('recipe-dialog'); // ambil kotak jendela resep
const dialogContent = document.getElementById('dialog-content'); // ambil isi dalam jendela
const closeDialogBtn = document.getElementById('close-dialog'); // ambil tombol silang penutup


favoriteCount.innerText = favorites.length; // ganti angka di atas sesuai jumlah resep favorit

//ambil data dari internet
fetch('https://dummyjson.com/recipes?limit=50') // Minta 50 resep ke server
  .then((res) => res.json()) // ubah kiriman server jadi data yang ngerti
  .then((data) => { // kalau data udah masuk
    recipes = data.recipes; // masukin semua resep ke wadah resep 
    console.log({ recipes }); // cek datanya di konsol

    
    loadingState.hidden = true; // sembunyiin tulisan lagi proses
    recipeGrid.hidden = false; // munculin papan resep

    
    generateCuisineOptions(); // buat pilihan asal negara di menu

    
    generateRecipeList(recipes); // tempel semua resep ke layar
  })
  .catch((err) => { // kalau internet mati atau gagal
    console.log('Error fetch data:', err); // tulis masalahnya di konsol
    loadingState.hidden = true; // sembunyiin tulisan lagi proses
    errorState.hidden = false; // munculin pesan koneksi rusak
  });

//bikin daftar pilihan negara
function generateCuisineOptions() { //buat pilihan asal negara
  let cuisines = []; // wadah buat nampung nama negara

  for (let i = 0; i < recipes.length; i++) { // cek resep satu per satu dari awal
    const cuisine = recipes[i].cuisine; // intip nama negara resep ini
    if (!cuisines.includes(cuisine)) { // kalau nama negaranya belum ada di wadah
      cuisines.push(cuisine); // masukin nama negara itu ke wadah
    }
  }

  for (let i = 0; i < cuisines.length; i++) { // cek nama negara yang udah terkumpul
    cuisineFilter.innerHTML += `<option value="${cuisines[i]}">${cuisines[i]}</option>`; // tempel jadi pilihan di menu
  }
}

// pajang daftar kartu resep
function generateRecipeList(dataResep) { // cara nempelin kartu resep ke layar
  recipeGrid.innerHTML = ''; // bersihin dulu papannya biar gak dobel
  recipeCount.innerText = `${dataResep.length} recipes`; // update angka total resep

  // kalau resepnya gak ketemu
  if (dataResep.length === 0) { // kalau wadahnya kosong melompong
    emptyState.hidden = false; // munculin tulisan resep gak ada
    recipeGrid.hidden = true; // sembunyiin papannya
    return; // stop, gak usah lanjut
  }

  emptyState.hidden = true; // sembunyiin tulisan resep gak ada
  recipeGrid.hidden = false; // munculin papannya

  // bikin kartu resep satu persatu
  for (let i = 0; i < dataResep.length; i++) { // hitung dari resep pertama sampai akhir
    const recipe = dataResep[i]; // ambil satu resep

    // cek resep ini udah difavoritkan atau belum
    let isFav = false; // anggap aja belum disuka
    for (let j = 0; j < favorites.length; j++) { // intip wadah favorit
      if (favorites[j].id === recipe.id) { // kalau nomor id-nya sama
        isFav = true; // tandai udah disuka
        break; // stop nyari
      }
    }

    const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes; // gabungin waktu nyiapin dan waktu masak

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
    `; // rakit dan tempel kartu resepnya ke papan
  }
}

//saring resep pas dicari
function filterData() { //milih resep yang sesuai
  const keyword = searchInput.value.toLowerCase(); // ambil kata yang diketik, bikin jadi huruf kecil
  const selectedCuisine = cuisineFilter.value; // ambil negara yang dipilih
  const selectedDifficulty = difficultyFilter.value; // ambil tingkat kesulitan yang dipilih

  let hasilFilter = []; // wadah buat simpen resep yang cocok

  for (let i = 0; i < recipes.length; i++) { // periksa resep satu per satu
    const recipe = recipes[i]; // ambil satu resep

    const matchSearch = recipe.name.toLowerCase().includes(keyword); // cocok gak sama kata yang diketik
    const matchCuisine = selectedCuisine === '' || recipe.cuisine === selectedCuisine; // cocok gak sama negaranya
    const matchDifficulty = selectedDifficulty === '' || recipe.difficulty === selectedDifficulty; // cocok gak sama tingkat susahnya

    if (matchSearch && matchCuisine && matchDifficulty) { // kalau semuanya pas
      hasilFilter.push(recipe); // masukin resepnya ke wadah cocok
    }
  }

  // atur tombol reset
  if (keyword !== '' || selectedCuisine !== '' || selectedDifficulty !== '') { // kalau kotak pencarian ada isinya
    resetFilterBtn.hidden = false; // munculin tombol ulang
  } else { // kalau kosong semua
    resetFilterBtn.hidden = true; // sembunyiin tombol ulang
  }

  generateRecipeList(hasilFilter); // pajang cuma resep yang cocok aja
}

//tambah atau hapus dari favorit
function toggleFavorite(id) { // cara pencet tombol hati
  let targetRecipe = null; // wadah buat resep yang dipencet

  for (let i = 0; i < recipes.length; i++) { // cari resep yang id-nya pas
    if (recipes[i].id === id) { // kalau ketemu id yang cocok
      targetRecipe = recipes[i]; // simpan resepnya
      break; // stop nyari
    }
  }

  let index = -1; // penanda belum ketemu
  for (let i = 0; i < favorites.length; i++) { // cek wadah favorit
    if (favorites[i].id === id) { // kalau ternyata udah ada di favorit
      index = i; // catat posisinya
      break; // stop nyari
    }
  }

  if (index !== -1) { // kalau resepnya emang udah ada di favorit
    favorites.splice(index, 1); // buang resep itu dari favorit
  } else { // kalau belum ada di favorit
    if (targetRecipe) { // kalau resepnya ketemu
      favorites.push(targetRecipe); // masukin ke favorit
    }
  }

  localStorage.setItem('favoriteRecipes', JSON.stringify(favorites)); // simpan daftar favorit terbaru ke memori
  favoriteCount.innerText = favorites.length; // update angka favorit di atas
  filterData(); // gambar ulang layarnya biar warna hatinya berubah
}

//buka jendela resep
function showDetail(id) { // cara nampilin resep lengkap
  let recipe = null; // wadah simpan resep

  for (let i = 0; i < recipes.length; i++) { // cari resep yang dipencet
    if (recipes[i].id === id) { // kalau id-nya pas
      recipe = recipes[i]; // simpan data resepnya
      break; // stop nyari
    }
  }

  if (!recipe) return; // kalau resepnya gak ada, gak usah lanjut

  let listBahan = ''; // wadah nulis bahan-bahan
  for (let i = 0; i < recipe.ingredients.length; i++) { // hitung semua bahannya
    listBahan += `<li>${recipe.ingredients[i]}</li>`; // tulis bahannya satu per satu
  }

  let listLangkah = ''; // wadah nulis cara bikin
  for (let i = 0; i < recipe.instructions.length; i++) { // hitung semua langkahnya
    listLangkah += `<p>${recipe.instructions[i]}</p>`; // tulis langkahnya satu per satu
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
  `; // rakit isi jendela resep

  recipeDialog.showModal(); // buka jendelanya di layar
}

closeDialogBtn.addEventListener('click', () => { // kalau tombol silang dipencet
  recipeDialog.close(); // tutup jendelanya
});


searchForm.addEventListener('submit', (e) => { // kalau tombol cari di keyboard dipencet
  e.preventDefault(); // tahan biar layarnya gak reload sendiri
  filterData(); // jalanin pencarian
});

searchInput.addEventListener('input', filterData); // jalanin pencarian tiap kali ngetik
cuisineFilter.addEventListener('change', filterData); // jalanin pencarian tiap ganti negara
difficultyFilter.addEventListener('change', filterData); // jalanin pencarian tiap ganti tingkat susah

favoriteButton.addEventListener('click', () => { // kalau tombol favorit di navbar dipencet
  sectionTitle.innerText = 'Favorite Recipes'; // ganti judul jadi favorit
  generateRecipeList(favorites); // munculin daftar resep favorit aja
});

resetFilterBtn.addEventListener('click', () => { // kalau tombol ulang dipencet
  searchInput.value = ''; // kosongin kotak ketik
  cuisineFilter.value = ''; // balikin pilihan negara ke awal
  difficultyFilter.value = ''; // balikin pilihan susah ke awal
  resetFilterBtn.hidden = true; // sembunyiin tombol ulang
  sectionTitle.innerText = 'Explore Recipes'; // balikin judul seperti semula
  generateRecipeList(recipes); // pajang lagi semua resep awal
});