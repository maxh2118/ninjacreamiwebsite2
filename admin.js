// admin.js (Versie 3 - Login + Fetch Test)
document.addEventListener('DOMContentLoaded', () => {
  const adminContent = document.getElementById('admin-content');

  try {
    if (typeof ADMIN_KEY === 'undefined') {
      throw new Error('ADMIN_KEY is niet gevonden. Controleer of config.js correct wordt geladen.');
    }

    const password = prompt('Voer het admin wachtwoord in:');

    if (password === ADMIN_KEY) {
      // Na succesvolle login, roepen we de nieuwe functie aan
      loadAdminData(adminContent); 
    } else if (password !== null) {
      adminContent.innerHTML = '<h1>Toegang Geweigerd</h1>';
      adminContent.style.color = 'red';
    }

  } catch (error) {
    adminContent.innerHTML = `<h1>Er is een fout opgetreden</h1><p style="color:red;">${error.message}</p>`;
  }
});

async function loadAdminData(adminContent) {
  adminContent.innerHTML = '<h1>Login Succesvol!</h1><p>Bezig met ophalen van recepten...</p>';

  try {
    const response = await fetch(`${API_URL}/admin-recipes`, {
      headers: {
        'X-Admin-Key': ADMIN_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Serverfout: ${response.status} ${response.statusText}`);
    }

    const recipes = await response.json();

    // Als het lukt, toon een succesbericht en log de data
    adminContent.innerHTML += `<p style="color:green;">Recepten succesvol opgehaald! (${recipes.length} gevonden)</p>`;
    console.log('Ontvangen recepten:', recipes);

  } catch (error) {
    // Als het mislukt, toon de fout
    adminContent.innerHTML += `<p style="color:red;">Fout bij ophalen recepten: ${error.message}</p>`;
    console.error(error);
  }
}