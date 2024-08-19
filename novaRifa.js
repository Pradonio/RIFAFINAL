import { db } from './firebase-config.js'; // Importa Firestore da configuração do Firebase
import { collection, addDoc, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

// Se houver um ID de rifa na URL, carrega os dados da rifa para edição
const urlParams = new URLSearchParams(window.location.search);
const raffleId = urlParams.get('id'); 

if (raffleId) {
    document.getElementById('formTitle').innerText = 'Editar Rifa'; 
    loadRaffleData(raffleId); 
}

// Função para carregar os dados da rifa
async function loadRaffleData(id) {
    try {
        const raffleRef = doc(db, 'rifas', id);
        const raffleSnap = await getDoc(raffleRef);
        if (raffleSnap.exists()) {
            const data = raffleSnap.data();
            document.getElementById('raffleName').value = data.name || '';
            document.getElementById('raffleDescription').value = data.description || '';
            document.getElementById('raffleValue').value = (data.value * 100).toFixed(2) || '';
            document.getElementById('raffleQuantity').value = data.quantity || '';
            document.getElementById('pixKey').value = data.pixKey || '';
            document.getElementById('pixName').value = data.pixName || '';
        } else {
            console.error('Rifa não encontrada');
        }
    } catch (error) {
        console.error('Erro ao carregar dados da rifa:', error.message);
    }
}

document.getElementById('raffleForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita o envio padrão do formulário

    const raffleName = document.getElementById('raffleName').value.trim();
    const raffleDescription = document.getElementById('raffleDescription').value.trim();
    const raffleValue = document.getElementById('raffleValue').value.trim().replace(/\D/g, ''); // Remove caracteres não numéricos
    const raffleQuantity = parseInt(document.getElementById('raffleQuantity').value, 10);
    const pixKey = document.getElementById('pixKey').value.trim();
    const pixName = document.getElementById('pixName').value.trim();

    try {
        if (raffleId) {
            // Atualiza rifa existente
            await updateRaffle(raffleId, {
                name: raffleName,
                description: raffleDescription,
                value: parseFloat(raffleValue) / 100,
                quantity: raffleQuantity,
                pixKey: pixKey,
                pixName: pixName,
            });
            alert('Rifa atualizada com sucesso!');
        } else {
            // Adiciona nova rifa
            await addDoc(collection(db, 'rifas'), {
                name: raffleName,
                description: raffleDescription,
                value: parseFloat(raffleValue) / 100,
                quantity: raffleQuantity,
                pixKey: pixKey,
                pixName: pixName,
                createdAt: new Date().toISOString(),
            });
            alert('Rifa cadastrada com sucesso!');
        }

        document.getElementById('raffleForm').reset(); // Limpa o formulário
        window.location.href = 'home.html'; // Redireciona para a página home após a criação ou atualização da rifa
    } catch (error) {
        console.error('Erro ao salvar rifa:', error.message);
        alert('Erro ao salvar rifa: ' + error.message);
    }
});

document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = 'home.html'; // Redireciona para a página home
});

// Função para atualizar a rifa
async function updateRaffle(id, raffleData) {
    try {
        const raffleRef = doc(db, 'rifas', id);
        await setDoc(raffleRef, raffleData, { merge: true });
    } catch (error) {
        console.error('Erro ao atualizar rifa:', error.message);
        alert('Erro ao atualizar rifa: ' + error.message);
    }
}
