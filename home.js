import { getFirestore, collection, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'; // Importa o módulo de autenticação
import { app } from './firebase-config.js';

const db = getFirestore(app);
const auth = getAuth(app);

// Função para carregar as rifas do Firestore
export async function loadRaffles() {
    const raffleList = document.getElementById('raffleList');
    raffleList.innerHTML = ''; // Limpa a lista antes de carregar novamente

    const raffleCollection = collection(db, 'rifas');
    const raffleSnapshot = await getDocs(raffleCollection);
    raffleSnapshot.forEach(rifaDoc => {
        const data = rifaDoc.data();
        const listItem = document.createElement('li');
        listItem.innerText = `${data.name} - ${data.quantity} números - ${data.description || 'Sem descrição'} - R$ ${data.value.toFixed(2)} - Criada em: ${new Date(data.createdAt).toLocaleString()}`;
        
        // Botão para gerenciar a rifa
        const manageBtn = document.createElement('button');
        manageBtn.innerText = 'Gerenciar';
        manageBtn.addEventListener('click', () => {
            window.location.href = `gerenciamentorifa.html?id=${rifaDoc.id}`; // Redireciona para a página de gerenciamento
        });

        // Botão para editar a rifa
        const editBtn = document.createElement('button');
        editBtn.innerText = 'Editar';
        editBtn.addEventListener('click', () => {
            window.location.href = `nova-rifa.html?id=${rifaDoc.id}`; // Redireciona para a página de edição
        });

        // Botão para deletar a rifa
        const deleteBtn = document.createElement('button');
        deleteBtn.innerText = 'Deletar';
        deleteBtn.addEventListener('click', async () => {
            const docRef = doc(db, 'rifas', rifaDoc.id);
            await deleteDoc(docRef);
            loadRaffles(); // Recarrega a lista após a exclusão
        });

        // Adiciona os botões à lista
        listItem.appendChild(manageBtn);
        listItem.appendChild(editBtn);
        listItem.appendChild(deleteBtn);
        raffleList.appendChild(listItem);
    });
}

// Redirecionar para a página de nova rifa
document.getElementById('newRaffleBtn').addEventListener('click', function() {
    window.location.href = 'nova-rifa.html'; // Redireciona para a página nova-rifa
});

// Função para fazer logout
async function logout() {
    try {
        await signOut(auth); // Faz logout do usuário
        window.location.href = 'login.html'; // Redireciona para a página de login após o logout
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

// Adiciona o listener para o botão de logout
document.getElementById('logoutBtn').addEventListener('click', logout);

// Carregar as rifas quando a página é carregada
window.onload = loadRaffles;
