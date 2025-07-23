// edit.js (DEFINITIEVE VERSIE)

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('id');
    const content = document.getElementById('edit-content');

    if (!recipeId) {
        content.innerHTML = '<h1>Fout: Geen recept ID gevonden.</h1>';
        return;
    }
    
    const adminKey = sessionStorage.getItem('adminKey') || prompt('Voer het admin wachtwoord in:');
    if (adminKey !== ADMIN_KEY) {
        content.innerHTML = '<h1>Toegang Geweigerd</h1>';
        return;
    }
    sessionStorage.setItem('adminKey', adminKey);
    
    loadRecipeForEditing(recipeId, content, adminKey);
});

async function loadRecipeForEditing(id, content, adminKey) {
    try {
        const response = await fetch(`${API_URL}/recipe/${id}`);
        if (!response.ok) throw new Error('Kon recept niet ophalen.');
        const recipe = await response.json();
        renderEditForm(recipe, content, adminKey);
    } catch(error) {
        content.innerHTML = `<h1>Fout bij laden</h1><p>${error.message}</p>`;
    }
}

function renderEditForm(recipe, content, adminKey) {
    content.innerHTML = `
        <a href="./admin.html" class="button" style="width: auto; padding: 0.5rem 1rem; margin-bottom: 2rem; background: #ccc; color: #333;"> &larr; Terug naar Admin Pagina</a>
        <h1>Recept Bewerken</h1>
        <form id="edit-form" class="recipe-form">
            <label>Titel</label><input id="edit-title" value="${recipe.title || ''}">
            <label>Omschrijving</label><textarea id="edit-description" rows="4">${recipe.description || ''}</textarea>
            <label>Foto URL</label><input id="edit-imageUrl" value="${recipe.imageUrl || ''}">
            <label>Categorie</label><select id="edit-category"></select>
            <label>Bereidingstijd</label><input id="edit-prepTime" value="${recipe.prepTime || ''}">
            <label>Programma</label><input id="edit-creamiProgram" value="${recipe.creamiProgram || ''}">
            <label>Ingrediënten (1 per regel)</label><textarea id="edit-ingredients" rows="8">${(recipe.ingredients || []).join('\n')}</textarea>
            <label>Instructies</label><textarea id="edit-instructions" rows="12">${recipe.instructions || ''}</textarea>
        </form>
        <div id="actions-bar" style="margin-top: 2rem; display: flex; flex-wrap: wrap; gap: 1rem;">
            <button id="save-btn">Wijzigingen Opslaan</button>
            ${recipe.status !== 'published' ? `<button id="approve-btn" style="background-color: var(--primary-color);">Goedkeuren</button>` : ''}
            <button id="delete-btn" style="background-color: #e74c3c; margin-left: auto;">Verwijderen</button>
        </div>
        <p id="status-message" style="margin-top: 1rem; font-weight: bold;"></p>
    `;

    const categorySelect = document.getElementById('edit-category');
    ['Ice Cream', 'Sorbet', 'Milkshake', 'Proteïne IJs', 'Vegan'].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        if (cat === recipe.category) option.selected = true;
        categorySelect.appendChild(option);
    });

    document.getElementById('save-btn').addEventListener('click', () => saveChanges(recipe.id, adminKey));
    const approveBtn = document.getElementById('approve-btn');
    if (approveBtn) {
        approveBtn.addEventListener('click', () => approveRecipe(recipe.id, adminKey));
    }
    document.getElementById('delete-btn').addEventListener('click', () => deleteRecipe(recipe.id, adminKey));
}

async function saveChanges(id, adminKey) {
    const statusMsg = document.getElementById('status-message');
    statusMsg.textContent = 'Bezig met opslaan...';
    const updatedData = {
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-description').value,
        imageUrl: document.getElementById('edit-imageUrl').value,
        category: document.getElementById('edit-category').value,
        prepTime: document.getElementById('edit-prepTime').value,
        creamiProgram: document.getElementById('edit-creamiProgram').value,
        ingredients: document.getElementById('edit-ingredients').value.split('\n').filter(i => i.trim() !== ''),
        instructions: document.getElementById('edit-instructions').value
    };
    
    try {
        const response = await fetch(`${API_URL}/admin-update/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
            body: JSON.stringify(updatedData)
        });
        if (!response.ok) throw new Error('Opslaan mislukt.');
        statusMsg.style.color = 'green';
        statusMsg.textContent = 'Wijzigingen succesvol opgeslagen!';
    } catch(error) {
        statusMsg.style.color = 'red';
        statusMsg.textContent = `Fout: ${error.message}`;
    }
}

async function approveRecipe(id, adminKey) {
    if (!confirm('Weet je zeker dat je dit recept wilt goedkeuren? Het wordt dan zichtbaar op de website.')) return;
    try {
        const response = await fetch(`${API_URL}/admin-approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
            body: JSON.stringify({ id })
        });
        if (!response.ok) throw new Error('Goedkeuren mislukt.');
        alert('Recept goedgekeurd!');
        window.location.href = './admin.html';
    } catch (error) {
        alert(`Fout: ${error.message}`);
    }
}

async function deleteRecipe(id, adminKey) {
    if (!confirm('Weet je zeker dat je dit recept permanent wilt verwijderen?')) return;
     try {
        const response = await fetch(`${API_URL}/admin-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Key': adminKey },
            body: JSON.stringify({ id })
        });
        if (!response.ok) throw new Error('Verwijderen mislukt.');
        alert('Recept verwijderd!');
        window.location.href = './admin.html';
    } catch (error) {
        alert(`Fout: ${error.message}`);
    }
}