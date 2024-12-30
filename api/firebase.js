import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Suas credenciais
const firebaseConfig = {
  apiKey: "AIzaSyB-8m3tHeUnkEPg19WYwepNQp7M80LycM4",
  authDomain: "hamburgueria-69d7a.firebaseapp.com",
  projectId: "hamburgueria-69d7a",
  storageBucket: "hamburgueria-69d7a.firebasestorage.app",
  messagingSenderId: "501082499235",
  appId: "1:501082499235:web:b779bdef0d329edd05f716",
  measurementId: "G-VX5Y8D8SZL"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = getFirestore(app);

export { db };
