// main.js (FINALE, COMPLETE VERSIE)

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.endsWith('index.html') || path.endsWith('/')) {
        loadHomePage();
    } else if (path.endsWith('recept.html')) {
        loadRecipeDetailPage();
    } else if (path.endsWith('insturen.html')) {
        setupSubmissionForm();
    } else if (path.endsWith('contact.html')) {
        setupContactForm();
    }
});

let allRecipes = [];

async function fetchRecipes() {
    try {
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
    if (!recipes || recipes.length === 0) {
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
                <p>${(recipe.description || '').substring(0, 100)}...</p>
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
    if (!searchBar || !categoryFilter) return;

    const filterAndSearch = () => {
        const searchTerm = searchBar.value.toLowerCase();
        const category = categoryFilter.value;
        let filteredRecipes = allRecipes;

        if (category) {
            filteredRecipes = filteredRecipes.filter(r => r.category === category);
        }
        if (searchTerm) {
            filteredRecipes = filteredRecipes.filter(r => (r.title || '').toLowerCase().includes(searchTerm));
        }
        displayRecipes(filteredRecipes);
    };

    searchBar.addEventListener('input', filterAndSearch);
    categoryFilter.addEventListener('change', filterAndSearch);
}

async function loadRecipeDetailPage() {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
    const content = document.getElementById('recipe-detail-content');
    if (!recipeId || !content) return;

    try {
        const response = await fetch(`${API_URL}/recipe/${recipeId}`);
        if (!response.ok) throw new Error('Recept niet gevonden.');
        const recipe = await response.json();
        
        document.title = recipe.title;

        content.innerHTML = `
            <h1>${recipe.title}</h1>
            <p><em>Ingezonden door: ${recipe.submittedBy}</em></p>
            <img src="${recipe.imageUrl || 'https://via.placeholder.com/800x400.png?text=Geen+Foto'}" alt="${recipe.title}" class="recipe-image-hero">
            <div class="recipe-meta">
                <span><strong>Bereidingstijd:</strong> ${recipe.prepTime || 'N/A'}</span>
                <span><strong>Categorie:</strong> ${recipe.category || 'N/A'}</span>
                <span><strong>Programma:</strong> ${recipe.creamiProgram || 'N/A'}</span>
            </div>
            <p>${recipe.description}</p>
            <div class="recipe-body">
                <div class="ingredients-list">
                    <h3>Ingrediënten</h3>
                    <ul>
                        ${(recipe.ingredients || []).map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>
                <div class="instructions">
                    <h3>Instructies</h3>
                    <p>${recipe.instructions || ''}</p>
                </div>
            </div>
        `;
    } catch (error) {
        content.innerHTML = '<h1>Fout bij laden van recept</h1><p>Dit recept kon niet worden gevonden.</p>';
    }
}

function setupSubmissionForm() {
    const form = document.getElementById('submission-form');
    const messageDiv = document.getElementById('form-message');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = form.querySelector('button');
        button.disabled = true;
        button.textContent = 'Bezig met versturen...';

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
            const response = await fetch(`${API_URL}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recipeData),
            });
            if (!response.ok) throw new Error('Er is iets misgegaan bij het versturen.');
            
            form.reset();
            messageDiv.style.display = 'block';
            messageDiv.textContent = 'Bedankt voor je inzending! Je recept wordt nagekeken en verschijnt na goedkeuring op de site.';
            messageDiv.style.color = 'green';
            button.disabled = false;
            button.textContent = 'Recept Insturen';
        } catch (error) {
            messageDiv.style.display = 'block';
            messageDiv.textContent = `Fout: ${error.message}`;
            messageDiv.style.color = 'red';
            button.disabled = false;
            button.textContent = 'Recept Insturen';
        }
    });
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    const messageDiv = document.getElementById('form-message');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = form.querySelector('button');
        button.disabled = true;
        button.textContent = 'Bezig met versturen...';

        const formData = {
            name: document.getElementById('contact-name').value,
            email: document.getElementById('contact-email').value,
            message: document.getElementById('contact-message').value,
        };

        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Kon bericht niet versturen.');

            form.reset();
            messageDiv.textContent = 'Bedankt voor je bericht! Ik neem zo snel mogelijk contact op.';
            messageDiv.style.color = 'green';
            button.disabled = false;
            button.textContent = 'Verstuur Bericht';
        } catch (error) {
            messageDiv.textContent = `Fout: ${error.message}`;
            messageDiv.style.color = 'red';
            button.disabled = false;
            button.textContent = 'Verstuur Bericht';
        }
    });
}