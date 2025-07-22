// main.js (Aangevuld met contactformulier logica)

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.endsWith('index.html') || path.endsWith('/')) {
        loadHomePage();
    } else if (path.endsWith('recept.html')) {
        loadRecipeDetailPage();
    } else if (path.endsWith('insturen.html')) {
        setupSubmissionForm(); // Deze functie moet ook nog worden toegevoegd/gecorrigeerd
    } else if (path.endsWith('contact.html')) {
        setupContactForm(); // NIEUW
    }
});

// ... (de functies fetchRecipes, displayRecipes, loadHomePage, loadRecipeDetailPage blijven hetzelfde) ...

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
            button.textContent = 'Verstuur Bericht';

        } catch (error) {
            messageDiv.textContent = `Fout: ${error.message}`;
            messageDiv.style.color = 'red';
            button.disabled = false;
            button.textContent = 'Verstuur Bericht';
        }
    });
}