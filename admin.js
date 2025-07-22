// admin.js (DEFINITIEVE VERSIE MET EXTRA CONTROLE)

document.addEventListener('DOMContentLoaded', () => {
    // ... de login-logica blijft hetzelfde ...
    const adminContent = document.getElementById('admin-content');
    
    const savedKey = sessionStorage.getItem('adminKey');
    if (savedKey === ADMIN_KEY) {
        loadAdminPanel();
    } else {
        showLogin();
    }
});

function showLogin() { /* ... ongewijzigd ... */ }

async function loadAdminPanel() { /* ... ongewijzigd ... */ }

async function fetchAllAdminRecipes() {
    try {
        const response = await fetch(`${API_URL}/admin-recipes`, {
            headers: { 'X-Admin-Key': ADMIN_KEY }
        });
        if (!response.ok) {
            // Gooi een meer specifieke fout op basis van de status
            throw new Error(`Serverfout: ${response.status} ${response.statusText}`);
        }
        const recipes = await response.json();
        
        const pendingContainer = document.getElementById('pending-recipes');
        const publishedContainer = document.getElementById('published-recipes');
        
        pendingContainer.innerHTML = '';
        publishedContainer.innerHTML = '';

        // ---- DE CORRECTIE IS HIER ----
        // We controleren eerst of 'r' wel bestaat voordat we r.status lezen.
        const pendingRecipes = recipes.filter(r => r && r.status === 'pending');
        const publishedRecipes = recipes.filter(r => r && r.status === 'published');
        // ---- EINDE CORRECTIE ----

        if (pendingRecipes.length === 0) pendingContainer.innerHTML = '<p>Geen recepten in afwachting.</p>';
        pendingRecipes.forEach(r => pendingContainer.appendChild(createAdminCard(r)));

        if (publishedRecipes.length === 0) publishedContainer.innerHTML = '<p>Geen gepubliceerde recepten.</p>';
        publishedRecipes.forEach(r => publishedContainer.appendChild(createAdminCard(r)));

    } catch (error) {
        console.error("Fout bij ophalen recepten:", error);
        document.getElementById('pending-recipes').innerHTML = `<p style="color: red;">Kon recepten niet laden: ${error.message}</p>`;
    }
}

function createAdminCard(recipe) { /* ... ongewijzigd ... */ }

async function approveRecipe(id) { /* ... ongewijzigd ... */ }

async function deleteRecipe(id) { /* ... ongewijzigd ... */ }

async function adminAction(endpoint, id) { /* ... ongewijzigd ... */ }

function setupAddForm() { /* ... ongewijzigd ... */ }