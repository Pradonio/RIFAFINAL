const auth = firebase.auth();

function showRegister() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'block';
}

function showLogin() {
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'block';
}

function register() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert('Usuário cadastrado com sucesso!');
            showLogin();
        })
        .catch((error) => {
            alert('Erro ao cadastrar: ' + error.message);
        });
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert('Login realizado com sucesso!');
            // Redirecionar para a página principal
        })
        .catch((error) => {
            alert('Erro ao fazer login: ' + error.message);
        });
}
