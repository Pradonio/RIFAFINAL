import { getFirestore, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { app } from './firebase-config.js';

const db = getFirestore(app);

// Função para carregar os dados da rifa
async function loadRaffle() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const raffleId = urlParams.get('id');
        if (!raffleId) {
            console.error('ID da rifa não fornecido na URL.');
            return;
        }

        const docRef = doc(db, 'rifas', raffleId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const { name, description, value, pixKey, quantity, reservedNumbers = {} } = docSnap.data();
            console.log('Dados da rifa:', { name, description, value, pixKey, quantity, reservedNumbers });

            document.getElementById('raffleName').innerText = name;
            document.getElementById('raffleDescription').innerText = description || 'Sem descrição';
            document.getElementById('raffleValue').innerText = `Valor do Número: R$ ${value ? value.toFixed(2) : 'Não informado'}`;

            const pixKeyElement = document.getElementById('pixKey');
            if (pixKey && pixKey.trim() !== '') {
                pixKeyElement.innerText = `Chave Pix: ${pixKey}`;
            } else {
                pixKeyElement.innerText = 'Sem chave Pix';
            }

            loadNumbers(quantity, reservedNumbers);

            // Verificar se o usuário é um administrador
            const isAdmin = await checkAdminStatus(); // Função para verificar se o usuário é admin
            if (isAdmin) {
                document.getElementById('backBtn').style.display = 'inline'; // Exibir botão de voltar
            }
        } else {
            console.error('Rifa não encontrada!');
        }
    } catch (error) {
        console.error('Erro ao carregar a rifa:', error);
    }
}

// Função para verificar se o usuário é administrador
async function checkAdminStatus() {
    // Implementar lógica para verificar se o usuário está logado como administrador
    // Exemplo de lógica fictícia:
    try {
        const user = firebase.auth().currentUser; // Supondo que você está usando Firebase Authentication
        if (user) {
            // Verifique se o usuário possui um perfil de admin
            const userRef = doc(db, 'admins', user.uid);
            const docSnap = await getDoc(userRef);
            return docSnap.exists(); // Se o documento existir, o usuário é admin
        }
        return false;
    } catch (error) {
        console.error('Erro ao verificar status de administrador:', error);
        return false;
    }
}

// Função para carregar os números e permitir reservas
function loadNumbers(quantity, reservedNumbers) {
    const numbersGrid = document.getElementById('numbersGrid');
    numbersGrid.innerHTML = '';

    for (let i = 1; i <= quantity; i++) {
        const numberItem = document.createElement('li');
        numberItem.innerText = i;
        numberItem.classList.add('number-item');

        if (reservedNumbers[i]) {
            const { name, approved } = reservedNumbers[i];
            numberItem.classList.add('reserved');
            numberItem.style.backgroundColor = approved ? 'red' : 'orange';
            numberItem.innerHTML += `<br>Reservado por: ${name}`;
        } else {
            numberItem.addEventListener('click', () => {
                document.getElementById('reservationForm').style.display = 'block';
                document.getElementById('reserveBtn').setAttribute('data-number', i);
            });
        }

        numbersGrid.appendChild(numberItem);
    }
}

// Função para reservar o número
document.getElementById('reserveBtn').addEventListener('click', async () => {
    const userName = document.getElementById('userName').value;
    const userPhone = document.getElementById('userPhone').value;
    const numberToReserve = document.getElementById('reserveBtn').getAttribute('data-number');

    if (!userName) {
        alert('Por favor, insira seu nome.');
        return;
    }

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const raffleId = urlParams.get('id');
        const docRef = doc(db, 'rifas', raffleId);
        const docSnap = await getDoc(docRef);

        const reservedNumbers = docSnap.data().reservedNumbers || {};
        if (reservedNumbers[numberToReserve]) {
            alert('Esse número já está reservado!');
            return;
        }

        await updateDoc(docRef, {
            [`reservedNumbers.${numberToReserve}`]: {
                name: userName,
                phone: userPhone || 'Não informado',
                timestamp: new Date().toISOString()
            }
        });

        alert(`Número ${numberToReserve} reservado com sucesso!`);
        window.location.reload();
    } catch (error) {
        console.error('Erro ao reservar o número:', error);
    }
});

// Função para copiar o link da página para a área de transferência
document.getElementById('copyLinkBtn').addEventListener('click', () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
        alert('Link da página copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar link da página:', err);
    });
});

// Função para copiar a chave Pix para a área de transferência
document.getElementById('copyPixKeyBtn').addEventListener('click', () => {
    const pixKeyElement = document.getElementById('pixKey');
    const pixKeyText = pixKeyElement.innerText.replace('Chave Pix: ', '');
    navigator.clipboard.writeText(pixKeyText).then(() => {
        alert('Chave Pix copiada para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar chave Pix:', err);
    });
});

// Função para compartilhar a rifa no WhatsApp
document.getElementById('shareWhatsAppBtn').addEventListener('click', () => {
    const link = window.location.href;
    const text = encodeURIComponent(`Confira esta rifa: ${link}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
});

// Função para mostrar as instruções
document.getElementById('howToUseBtn').addEventListener('click', () => {
    document.getElementById('instructions').style.display = 'block';
});

// Função para ocultar as instruções quando o botão "Voltar" for clicado
document.getElementById('backBtn').addEventListener('click', () => {
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('reservationForm').style.display = 'none';
});

loadRaffle();
