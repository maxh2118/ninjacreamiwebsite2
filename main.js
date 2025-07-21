// main.js

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('index.html') || path === '/') {
        loadHomePage();
    } else if (path.includes('recept.html')) {
        loadRecipeDetailPage();
    } else if (path.includes('insturen.html')) {
        setupSubmissionForm();
    }
});

let allRecipes = [];

async function fetchRecipes() {
    try {
        const response = await fetch(`${API_URL}/recipes`);
        if (!response.ok) throw new Error('Kon recepten niet ophalen.');
        allRecipes = await response.json();
    } catch (error) {
        console.error(error);
        const grid = document.getElementById('recipe-grid');
        if(grid) grid.innerHTML = '<p>Er is een fout opgetreden bij het laden van de recepten.</p>';
    }
}

function displayRecipes(recipes) {
    const grid = document.getElementById('recipe-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (recipes.length === 0) {
        grid.innerHTML = '<p>Geen recepten gevonden die voldoen aan je zoekopdracht.</p>';
        return;
    }
    recipes.forEach(recipe => {
        const card = document.createElement('a');
        card.href = `recept.html?id=${recipe.id}`;
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${recipe.imageUrl || 'https://via.placeholder.com/400x200.png?text=Geen+Foto'}" alt="${recipe.title}">
            <div class="recipe-card-content">
                <h3>${recipe.title}</h3>
                <p>${recipe.description.substring(0, 100)}...</p>
                <span>Categorie: ${recipe.category}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

async function loadHomePage() {
    await fetchRecipes();
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
                r.title.toLowerCase().includes(searchTerm) ||
                r.description.toLowerCase().includes(searchTerm)
            );
        }
        displayRecipes(filteredRecipes);
    };

    searchBar.addEventListener('input', filterAndSearch);
    categoryFilter.addEventListener('change', filterAndSearch);
}

async function loadRecipeDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
    if (!recipeId) {
        document.getElementById('recipe-detail-content').innerHTML = '<h1>Recept niet gevonden</h1>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/recipe/${recipeId}`);
        if (!response.ok) throw new Error('Recept niet gevonden.');
        const recipe = await response.json();
        
        document.title = recipe.title;

        const content = document.getElementById('recipe-detail-content');
        content.innerHTML = `
            <h1>${recipe.title}</h1>
            <p><em>Ingezonden door: ${recipe.submittedBy}</em></p>
            <img src="${recipe.imageUrl || 'https://via.placeholder.com/800x400.png?text=Geen+Foto'}" alt="${recipe.title}" class="recipe-image-hero">
            <div class="recipe-meta">
                <span><strong>Bereidingstijd:</strong> ${recipe.prepTime || 'N/A'}</span>
                <span><strong>Categorie:</strong> ${recipe.category || 'N/A'}</span>
                <span><strong>Programma:</strong> ${recipe.creamiProgram || 'N/A'}</span>
                <span id="share-info">
                    <button id="share-button" class="share-button">Deel Recept</button>
                    (${recipe.shareCount} keer gedeeld)
                </span>
            </div>
            <p>${recipe.description}</p>
            <div class="recipe-body">
                <div class="ingredients-list">
                    <h3>Ingrediënten</h3>
                    <ul>
                        ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>
                <div class="instructions">
                    <h3>Instructies</h3>
                    <p style="white-space: pre-wrap;">${recipe.instructions}</p>
                </div>
            </div>
        `;

        document.getElementById('share-button').addEventListener('click', async () => {
            await fetch(`${API_URL}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: recipeId })
            });

            if (navigator.share) {
                navigator.share({
                    title: recipe.title,
                    text: `Bekijk dit heerlijke Ninja Creami recept: ${recipe.title}`,
                    url: window.location.href,
                });
            } else {
                alert('Deel dit recept door de link te kopiëren!');
            }
             // Optimistically update UI
            const shareInfo = document.getElementById('share-info');
            shareInfo.innerHTML = `
                <button class="share-button">Deel Recept</button>
                (${recipe.shareCount + 1} keer gedeeld)
            `;
        });

    } catch (error) {
        console.error(error);
        document.getElementById('recipe-detail-content').innerHTML = '<h1>Fout bij laden van recept</h1><p>Dit recept kon niet worden gevonden.</p>';
    }
}

function setupSubmissionForm() {
    const form = document.getElementById('submission-form');
    const messageDiv = document.getElementById('form-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Basic bot check
        const turnstileResponse = form.querySelector('[name="cf-turnstile-response"]')?.value;
        if (!turnstileResponse) {
             messageDiv.textContent = 'Verifieer a.u.b. dat u geen robot bent.';
             messageDiv.style.color = 'red';
             messageDiv.style.display = 'block';
             return;
        }

        const recipeData = {
            submittedBy: document.getElementById('submittedBy').value,
            submitterEmail: document.getElementById('submitterEmail').value,
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            imageUrl: document.getElementById('imageUrl').value,
            category: document.getElementById('category').value,
            prepTime: document.getElementById('prepTime').value,
            creamiProgram: document.getElementById('creamiProgram').value,
            ingredients: document.getElementById('ingredients').value.split('\n').filter(i => i.trim() !== ''),
            instructions: document.getElementById('instructions').value,
        };

        try {
            messageDiv.textContent = 'Bezig met versturen...';
            messageDiv.style.color = 'black';
            messageDiv.style.display = 'block';

            const response = await fetch(`${API_URL}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipeData),
            });

            if (!response.ok) throw new Error('Er is iets misgegaan bij het versturen.');
            
            form.reset();
            messageDiv.textContent = 'Bedankt voor je inzending! Je recept wordt nagekeken en verschijnt na goedkeuring op de site.';
            messageDiv.style.color = 'green';

        } catch (error) {
            messageDiv.textContent = `Fout: ${error.message}`;
            messageDiv.style.color = 'red';
        }
    });
}