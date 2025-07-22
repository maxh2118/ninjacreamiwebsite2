// admin.js (Tijdelijke Testversie)
document.addEventListener('DOMContentLoaded', () => {
  const adminContent = document.getElementById('admin-content');
  
  if (adminContent) {
    adminContent.innerHTML = '<h1>Test: JavaScript Werkt!</h1>';
    adminContent.style.color = 'green';
    console.log('Test script succesvol uitgevoerd.');
  } else {
    console.error('Test mislukt: Kon #admin-content element niet vinden.');
  }
});