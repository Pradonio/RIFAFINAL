import { db } from './firebase-config.js'; // Certifique-se de que o caminho está correto
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

window.addEventListener('DOMContentLoaded', async () => {
    const drawnNumberElement = document.getElementById('drawnNumber');
    const reservedByElement = document.getElementById('reservedBy');
    const drawButton = document.getElementById('drawNumberBtn');
    const shareButton = document.getElementById('shareButton');
    const saveButton = document.getElementById('saveButton');
    const questionMarkElement = document.getElementById('questionMark');

    let raffleId = new URLSearchParams(window.location.search).get('id'); // Obtém o ID da rifa da URL
    let numbers = []; // Lista de números disponíveis
    let reservations = {}; // Mapeia números para reservas
    let hasDrawn = false; // Verifica se já foi sorteado
    let selectedNumber = null; // Armazena o número sorteado

    // Pega os números e reservas do Firestore
    try {
        const raffleDocRef = doc(db, 'rifas', raffleId); // Referência ao documento da rifa
        const docSnap = await getDoc(raffleDocRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            numbers = Array.from({ length: data.quantity }, (_, i) => i + 1); // Cria uma lista de números
            reservations = data.reservedNumbers || {}; // Obtém as reservas

            // Limpa a tela
            drawnNumberElement.textContent = '';
            reservedByElement.textContent = '';
        } else {
            console.log("Nenhuma rifa encontrada.");
        }
    } catch (error) {
        console.error("Erro ao acessar o banco de dados:", error);
    }

    // Função para compartilhar no WhatsApp
    function shareOnWhatsApp(number, reservedBy) {
        const message = `Número sorteado: ${number}\nReservado por: ${reservedBy}`;
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // Função para salvar a imagem
    function saveImage() {
        html2canvas(document.body, {
            useCORS: true
        }).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'sorteio.png';
            link.click();
        }).catch(error => {
            console.error("Erro ao salvar a imagem:", error);
        });
    }

    // Lógica de sorteio
    drawButton.addEventListener('click', () => {
        if (hasDrawn) {
            if (confirm("O sorteio já foi realizado. Deseja realizar um novo sorteio?")) {
                hasDrawn = false;
                drawButton.disabled = false;
                drawnNumberElement.textContent = '';
                reservedByElement.textContent = '';
                questionMarkElement.textContent = '?';
                shareButton.style.display = 'none';
                saveButton.style.display = 'none';
            }
            return;
        }

        if (numbers.length === 0) {
            alert("Nenhum número disponível para sortear.");
            return;
        }

        // Substitui o ponto de interrogação pelo número aleatório
        let interval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * numbers.length);
            drawnNumberElement.textContent = numbers[randomIndex];
            questionMarkElement.textContent = ''; // Remove o ponto de interrogação
        }, 50); // Aumenta a frequência para um efeito mais rápido

        // Diminui a velocidade até parar
        setTimeout(() => {
            clearInterval(interval);

            // Escolhe um número final
            selectedNumber = numbers[Math.floor(Math.random() * numbers.length)];
            drawnNumberElement.textContent = selectedNumber;

            // Exibe a pessoa que reservou o número
            const reservation = reservations[selectedNumber];
            if (reservation) {
                reservedByElement.textContent = `Reservado por: ${reservation.name}`;
            } else {
                reservedByElement.textContent = 'Número não reservado.';
            }

            // Exibe os botões de compartilhamento e salvar imagem
            shareButton.style.display = 'inline-block';
            saveButton.style.display = 'inline-block';
            drawButton.disabled = true;
            hasDrawn = true;
        }, 3000); // 3 segundos de "animação"
    });

    // Evento para compartilhar no WhatsApp
    shareButton.addEventListener('click', () => {
        if (selectedNumber) {
            const reservedBy = reservedByElement.textContent.replace('Reservado por: ', '');
            shareOnWhatsApp(selectedNumber, reservedBy);
        }
    });

    // Evento para salvar a imagem
    saveButton.addEventListener('click', () => {
        saveImage();
    });
});
