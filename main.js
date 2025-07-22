// main.js (DEFINITIEVE EN COMPLETE VERSIE)

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.endsWith('index.html') || path.endsWith('/')) {
        loadHomePage();
    } else if (path.endsWith('recept.html')) {
        loadRecipeDetailPage();
    } else if (path.endsWith('insturen.html')) {
        // De logica voor insturen.html blijft hetzelfde
    }
});

let allRecipes = [];

async function fetchRecipes() {
    try {
        // Deze URL is nu correct en wordt door de Worker afgehandeld
        const response = await fetch(`${API_URL}/recipes`);
        if (!response.ok) throw new Error('Kon recepten niet ophalen van de server.');
        allRecipes = await response.json();
    } catch (error) {
        console.error(error);
        const grid = document.getElementById('recipe-grid');
        if(grid) grid.innerHTML = '<p style="color: red;">Er is een fout opgetreden bij het laden van de recepten.</p>';
    }
}

function displayRecipes(recipes) {
    const grid = document.getElementById('recipe-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (recipes.length === 0) {
        grid.innerHTML = '<p>Geen recepten gevonden.</p>';
        return;
    }
    recipes.forEach(recipe => {
        const card = document.createElement('a');
        card.href = `./recept.html?id=${recipe.id}`;
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.imageUrl || 'https://via.placeholder.com/400x200.png?text=Geen+Foto'}" alt="${recipe.title}">
            <div class="recipe-card-content">
                <h3>${recipe.title}</h3>
                <p>${recipe.description ? recipe.description.substring(0, 100) : ''}...</p>
                <span>Categorie: ${recipe.category}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function loadHomePage() {
    await fetchRecipes();
    // Toon alle recepten standaard
    displayRecipes(allRecipes);

    const searchBar = document.getElementById('search-bar');
    const categoryFilter = document.getElementById('category-filter');

    const filterAndSearch = () => {
        const searchTerm = searchBar.value.toLowerCase();
        const category = categoryFilter.value;
        let filteredRecipes = allRecipes;

        if (category) {
            filteredRecipes = filteredRecipes.filter(r => r.category === category);
        }

        if (searchTerm) {
            filteredRecipes = filteredRecipes.filter(r =>
                (r.title && r.title.toLowerCase().includes(searchTerm)) ||
                (r.description && r.description.toLowerCase().includes(searchTerm))
            );
        }
        displayRecipes(filteredRecipes);
    };

    searchBar.addEventListener('input', filterAndSearch);
    categoryFilter.addEventListener('change', filterAndSearch);
}

async function loadRecipeDetailPage() {
    // ... (deze functie blijft hetzelfde als voorheen)
}