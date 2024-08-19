// script.js

import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { app } from './firebase-config.js'; // Certifique-se de exportar o app do firebase-config.js

const auth = getAuth(app); // Inicialize o auth com a app do Firebase

// Adicione event listeners
document.getElementById('logoutBtn')?.addEventListener('click', logout);
document.getElementById('loginBtn')?.addEventListener('click', login);
document.getElementById('registerBtn')?.addEventListener('click', register);
document.getElementById('showRegister')?.addEventListener('click', showRegister);
document.getElementById('showLogin')?.addEventListener('click', showLogin);

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Usuário logado:', userCredential.user);
        alert('Login realizado com sucesso!');
        // Redirecionar para a página home
        window.location.href = 'home.html'; // Mude isso para o caminho da sua página home
    } catch (error) {
        console.error('Erro ao fazer login:', error.message);
        alert('Erro ao fazer login: ' + error.message);
    }
}

async function register() {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!email || !password) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Usuário registrado:', userCredential.user);
        alert('Cadastro realizado com sucesso! Você pode fazer login agora.');
        showLogin(); // Alternar para a tela de login após cadastro
    } catch (error) {
        console.error('Erro ao registrar:', error.message);
        alert('Erro ao registrar: ' + error.message);
    }
}

function showRegister() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';
}

function showLogin() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('registerSection').style.display = 'none';
}

function logout() {
    signOut(auth).then(() => {
        // Logout bem-sucedido.
        alert('Logout realizado com sucesso!');
        window.location.href = 'index.html'; // Redirecionar para a página de login
    }).catch((error) => {
        console.error('Erro ao fazer logout:', error.message);
        alert('Erro ao fazer logout: ' + error.message);
    });
}
