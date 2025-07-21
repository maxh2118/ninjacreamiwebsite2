// admin.js (VOLLEDIGE EN WERKENDE VERSIE)

document.addEventListener('DOMContentLoaded', () => {
    const adminContent = document.getElementById('admin-content');
    
    const savedKey = sessionStorage.getItem('adminKey');
    if (savedKey === ADMIN_KEY) {
        loadAdminPanel();
    } else {
        showLogin();
    }
});

function showLogin() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `
        <div class="recipe-form">
            <h1>Admin Login</h1>
            <label for="password">Wachtwoord:</label>
            <input type="password" id="password">
            <button id="login-button">Login</button>
        </div>
    `;
    document.getElementById('login-button').addEventListener('click', () => {
        const password = document.getElementById('password').value;
        if (password === ADMIN_KEY) {
            sessionStorage.setItem('adminKey', ADMIN_KEY);
            loadAdminPanel();
        } else {
            alert('Incorrect wachtwoord');
        }
    });
}

async function loadAdminPanel() {
    const adminContent = document.getElementById('admin-content');
    adminContent.innerHTML = `
        <h1>Admin Panel</h1>
        <button id="logout-button" style="width: auto; padding: 0.5rem 1rem; background-color: #e74c3c;">Logout</button>
        
        <section class="admin-section">
            <h2>Nieuw Recept Toevoegen</h2>
            <form id="add-recipe-form" class="recipe-form" style="padding: 1rem;">
                 <label for="title">Titel *</label><input type="text" id="add-title" required>
                 <label for="description">Omschrijving *</label><textarea id="add-description" required></textarea>
                 <label for="imageUrl">Foto URL</label><input type="url" id="add-imageUrl">
                 <label for="category">Categorie *</label>
                 <select id="add-category" required>
                     <option value="Ice Cream">Ice Cream</option>
                     <option value="Sorbet">Sorbet</option>
                     <option value="Milkshake">Milkshake</option>
                     <option value="Proteïne IJs">Proteïne IJs</option>
                     <option value="Vegan">Vegan</option>
                 </select>
                 <label for="prepTime">Bereidingstijd</label><input type="text" id="add-prepTime">
                 <label for="creamiProgram">Programma</label><input type="text" id="add-creamiProgram">
                 <label for="ingredients">Ingrediënten (1 per regel)</label><textarea id="add-ingredients" rows="5" required></textarea>
                 <label for="instructions">Instructies</label><textarea id="add-instructions" rows="8" required></textarea>
                 <button type="submit">Voeg Recept Toe</button>
            </form>
        </section>

        <section class="admin-section">
            <h2>Ingestuurde Recepten (wachten op goedkeuring)</h2>
            <div id="pending-recipes">Laden...</div>
        </section>

        <section class="admin-section">
            <h2>Gepubliceerde Recepten</h2>
            <div id="published-recipes">Laden...</div>
        </section>
    `;

    document.getElementById('logout-button').addEventListener('click', () => {
        sessionStorage.removeItem('adminKey');
        showLogin();
    });

    setupAddForm();
    fetchAllAdminRecipes();
}

async function fetchAllAdminRecipes() {
    try {
        const response = await fetch(`${API_URL}/admin-recipes`, {
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        if (!response.ok) throw new Error('Kon recepten niet ophalen');
        const recipes = await response.json();
        
        const pendingContainer = document.getElementById('pending-recipes');
        const publishedContainer = document.getElementById('published-recipes');
        
        pendingContainer.innerHTML = '';
        publishedContainer.innerHTML = '';

        const pendingRecipes = recipes.filter(r => r.status === 'pending');
        const publishedRecipes = recipes.filter(r => r.status === 'published');

        if (pendingRecipes.length === 0) pendingContainer.innerHTML = '<p>Geen recepten in afwachting.</p>';
        pendingRecipes.forEach(r => pendingContainer.appendChild(createAdminCard(r)));

        if (publishedRecipes.length === 0) publishedContainer.innerHTML = '<p>Geen gepubliceerde recepten.</p>';
        publishedRecipes.forEach(r => publishedContainer.appendChild(createAdminCard(r)));

    } catch (error) {
        console.error(error);
        alert('Fout bij het laden van recepten.');
    }
}

function createAdminCard(recipe) {
    const card = document.createElement('div');
    card.className = 'admin-recipe-card';
    card.innerHTML = `
        <h4>${recipe.title}</h4>
        <p><em>Ingezonden door: ${recipe.submittedBy}</em></p>
        <div>
            ${recipe.status === 'pending' ? `<button class="approve-btn" data-id="${recipe.id}">Goedkeuren</button>` : ''}
            <button class="delete-btn" data-id="${recipe.id}">Verwijderen</button>
        </div>
    `;

    if (recipe.status === 'pending') {
        card.querySelector('.approve-btn').addEventListener('click', () => approveRecipe(recipe.id));
    }
    card.querySelector('.delete-btn').addEventListener('click', () => deleteRecipe(recipe.id));
    
    return card;
}

async function approveRecipe(id) {
    if (!confirm('Weet je zeker dat je dit recept wilt goedkeuren?')) return;
    await adminAction('admin-approve', id);
}

async function deleteRecipe(id) {
    if (!confirm('Weet je zeker dat je dit recept permanent wilt verwijderen?')) return;
    await adminAction('admin-delete', id);
}

async function adminAction(endpoint, id) {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY },
            body: JSON.stringify({ id })
        });
        if (!response.ok) throw new Error('Actie mislukt');
        fetchAllAdminRecipes(); // Refresh list
    } catch (error) {
        alert(`Fout: ${error.message}`);
    }
}

function setupAddForm() {
    const form = document.getElementById('add-recipe-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const recipeData = {
            title: document.getElementById('add-title').value,
            description: document.getElementById('add-description').value,
            imageUrl: document.getElementById('add-imageUrl').value,
            category: document.getElementById('add-category').value,
            prepTime: document.getElementById('add-prepTime').value,
            creamiProgram: document.getElementById('add-creamiProgram').value,
            ingredients: document.getElementById('add-ingredients').value.split('\n').filter(i => i.trim() !== ''),
            instructions: document.getElementById('add-instructions').value,
        };

        try {
            const response = await fetch(`${API_URL}/admin-add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Admin-Key': ADMIN_KEY },
                body: JSON.stringify(recipeData)
            });
            if (!response.ok) throw new Error('Kon recept niet toevoegen');
            form.reset();
            fetchAllAdminRecipes(); // Refresh list
        } catch (error) {
            alert(`Fout: ${error.message}`);
        }
    });
}