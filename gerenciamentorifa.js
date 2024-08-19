import { getFirestore, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';
import { app } from './firebase-config.js';

const db = getFirestore(app);
let currentRaffleId; // Variável para armazenar o ID da rifa atual

// Função para carregar os detalhes da rifa
async function loadRaffleDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    currentRaffleId = urlParams.get('id'); // Obtém o ID da rifa da URL

    const raffleDocRef = doc(db, 'rifas', currentRaffleId);
    const raffleDoc = await getDoc(raffleDocRef);

    if (raffleDoc.exists()) {
        const data = raffleDoc.data();
        const raffleDetailsDiv = document.getElementById('raffleDetails');

        // Exibe os detalhes da rifa
        raffleDetailsDiv.innerHTML = `
            <h2>${data.name}</h2>
            <p>Quantidade de Números: ${data.quantity}</p>
            <p>Descrição: ${data.description || 'Sem descrição'}</p>
            <p>Valor: R$ ${data.value.toFixed(2)}</p>
            <p>Criada em: ${new Date(data.createdAt).toLocaleString()}</p>
        `;

        // Atualiza valores de arrecadação
        updateEarnings(data.value, data.quantity, data.reservedNumbers || {});

        // Chama a função para criar o grid de números
        createNumbersGrid(data.quantity, data.reservedNumbers || {});
        displayReservations(data.reservedNumbers || {});
    } else {
        console.log('Rifa não encontrada');
    }
}

// Função para atualizar os valores de arrecadação
function updateEarnings(value, quantity, reservedNumbers) {
    const totalEstimated = value * quantity; // Valor estimado de arrecadação
    const totalCurrent = Object.keys(reservedNumbers).filter(num => reservedNumbers[num].approved).length * value; // Valor atual

    document.getElementById('estimatedEarningsLabel').innerText = `Valor Estimado de Arrecadação: R$ ${totalEstimated.toFixed(2)}`;
    document.getElementById('currentEarningsLabel').innerText = `Valor Atual de Arrecadação: R$ ${totalCurrent.toFixed(2)}`;
}

// Função para criar o grid de números
function createNumbersGrid(quantity, reservedNumbers) {
    const numbersGrid = document.getElementById('numbersGrid');
    numbersGrid.innerHTML = ''; // Limpa a lista antes de adicionar novos números

    for (let i = 1; i <= quantity; i++) {
        const listItem = document.createElement('li');
        listItem.innerText = i; // Exibe o número

        // Verifica se o número está reservado e aplica a classe apropriada
        if (reservedNumbers[i]) {
            listItem.classList.add('reserved'); // Adiciona classe de reservado
            listItem.style.backgroundColor = reservedNumbers[i].approved ? 'red' : 'orange'; // Altera a cor para vermelho se aprovado, laranja se reservado
            listItem.innerHTML += `<br>Reservado por: ${reservedNumbers[i].name}`; // Adiciona nome acima do número
            
            // Adiciona evento de clique para aprovar ou reprovar a reserva
            listItem.addEventListener('click', () => {
                document.getElementById('reservationForm').style.display = 'block';
                document.getElementById('approveBtn').setAttribute('data-number', i); // Guarda o número a ser aprovado
                document.getElementById('rejectBtn').setAttribute('data-number', i); // Guarda o número a ser reprovado
            });
        }

        numbersGrid.appendChild(listItem); // Adiciona o número ao grid
    }
}

// Função para exibir a lista de reservas
function displayReservations(reservedNumbers) {
    const reservationsListByNumber = document.getElementById('reservationsListByNumber');
    const reservationsListByDate = document.getElementById('reservationsListByDate');

    reservationsListByNumber.innerHTML = ''; // Limpa a lista de reservas por número
    reservationsListByDate.innerHTML = ''; // Limpa a lista de reservas por data/hora

    // Armazena as reservas em um array
    const reservationsArray = Object.entries(reservedNumbers).map(([number, details]) => ({
        number,
        name: details.name,
        timestamp: new Date(details.timestamp),
        approved: details.approved || false
    }));

    // Exibe reservas em ordem numérica
    reservationsArray.sort((a, b) => a.number - b.number).forEach(({ number, name, approved }) => {
        const listItem = document.createElement('li');
        listItem.innerText = `Número ${number}: Reservado por ${name} - ${approved ? 'Aprovado' : 'Pendente'}`;
        reservationsListByNumber.appendChild(listItem); // Adiciona a reserva à lista
    });

    // Exibe reservas em ordem de data/hora
    reservationsArray.sort((a, b) => a.timestamp - b.timestamp).forEach(({ number, name, timestamp, approved }) => {
        const listItem = document.createElement('li');
        const formattedTime = timestamp.toLocaleString(); // Formata a data/hora
        listItem.innerText = `Número ${number}: Reservado por ${name} em ${formattedTime} - ${approved ? 'Aprovado' : 'Pendente'}`;
        reservationsListByDate.appendChild(listItem); // Adiciona a reserva à lista
    });
}

// Função para aprovar a reserva
async function approveReservation(number) {
    const raffleDocRef = doc(db, 'rifas', currentRaffleId);
    const raffleDoc = await getDoc(raffleDocRef);
    const data = raffleDoc.data();

    if (data.reservedNumbers[number]) {
        data.reservedNumbers[number].approved = true; // Marca como aprovado
        await updateDoc(raffleDocRef, { reservedNumbers: data.reservedNumbers });
        loadRaffleDetails(); // Recarrega os detalhes da rifa
    }
}

// Função para reprovar a reserva
async function rejectReservation(number) {
    const raffleDocRef = doc(db, 'rifas', currentRaffleId);
    const raffleDoc = await getDoc(raffleDocRef);
    const data = raffleDoc.data();

    if (data.reservedNumbers[number]) {
        delete data.reservedNumbers[number]; // Remove a reserva
        await updateDoc(raffleDocRef, { reservedNumbers: data.reservedNumbers });
        loadRaffleDetails(); // Recarrega os detalhes da rifa
    }
}

// Função para abrir a página de compartilhar rifa
function openRaffle() {
    const urlParams = new URLSearchParams(window.location.search);
    const raffleId = urlParams.get('id');
    window.location.href = `compartilhar-rifa.html?id=${raffleId}`; // Redireciona para a página de compartilhar rifa
}

// Adiciona eventos aos botões
document.getElementById('openRaffleBtn').addEventListener('click', openRaffle); // Evento para abrir a rifa
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'home.html'; // Redireciona de volta para a página inicial
});
document.getElementById('approveBtn').addEventListener('click', () => {
    const number = document.getElementById('approveBtn').getAttribute('data-number');
    approveReservation(number); // Aprova a reserva
    document.getElementById('reservationForm').style.display = 'none'; // Esconde o formulário
});
document.getElementById('rejectBtn').addEventListener('click', () => {
    const number = document.getElementById('rejectBtn').getAttribute('data-number');
    rejectReservation(number); // Reprova a reserva
    document.getElementById('reservationForm').style.display = 'none'; // Esconde o formulário
});

// Função para abrir a página de sorteio
function openDrawPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const raffleId = urlParams.get('id');
    window.location.href = `sorteio.html?id=${raffleId}`; // Redireciona para a página de sorteio
}

// Adiciona o evento ao botão de sorteio
document.getElementById('drawBtn').addEventListener('click', openDrawPage);

// Inicializa a página carregando os detalhes da rifa
loadRaffleDetails();
