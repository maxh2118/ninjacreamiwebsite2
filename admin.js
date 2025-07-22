// admin.js (Versie 2 - Alleen Login Test)
document.addEventListener('DOMContentLoaded', () => {
  const adminContent = document.getElementById('admin-content');

  try {
    // Test 1: Controleer of de ADMIN_KEY uit config.js beschikbaar is.
    if (typeof ADMIN_KEY === 'undefined') {
      throw new Error('ADMIN_KEY is niet gevonden. Controleer of config.js correct wordt geladen.');
    }

    // Test 2: Vraag om het wachtwoord via een pop-up.
    const password = prompt('Voer het admin wachtwoord in:');

    // Test 3: Controleer het wachtwoord.
    if (password === ADMIN_KEY) {
      adminContent.innerHTML = '<h1>Login Succesvol!</h1><p>De volgende stap is het laden van de recepten...</p>';
      adminContent.style.color = 'green';
    } else if (password !== null) { // Alleen als niet op Annuleren is geklikt
      adminContent.innerHTML = '<h1>Toegang Geweigerd</h1>';
      adminContent.style.color = 'red';
    }

  } catch (error) {
    // Vang eventuele andere fouten op en toon ze.
    adminContent.innerHTML = `<h1>Er is een fout opgetreden</h1><p style="color:red;">${error.message}</p>`;
  }
});