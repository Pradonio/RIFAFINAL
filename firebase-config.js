// Importa as funções necessárias dos SDKs que você precisa
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Configuração do seu aplicativo Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDu9XKdaOTjFyQLm7ZyCaOuShNtsH8xNco",
  authDomain: "rifafinal-cbc64.firebaseapp.com",
  projectId: "rifafinal-cbc64",
  storageBucket: "rifafinal-cbc64.appspot.com",
  messagingSenderId: "333309588498",
  appId: "1:333309588498:web:4406d24e19d7e1e0aa14cb"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); // Inicializa o Firebase Storage
const auth = getAuth(app); // Inicializa o Firebase Authentication

// Exporta app, db, storage e auth para uso em outros módulos
export { app, db, storage, auth };
