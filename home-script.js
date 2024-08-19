import { auth } from './firebase-config.js';

// Faz logout
async function logout() {
    await auth.signOut();
    window.location.href = 'index.html'; // Redireciona para a página de login após logout
}

// Evento de clique no botão de logout
document.getElementById('logout-button').addEventListener('click', logout);
