import admin from 'firebase-admin';

// Inicializar o Firebase Admin com o arquivo de credenciais
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            "type": "service_account",
            "project_id": "hamburgueria-69d7a",
            "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
            "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            "client_email": "firebase-adminsdk-xxxxx@hamburgueria-69d7a.iam.gserviceaccount.com",
            "client_id": "xxxxxxxxxx",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "your-client-cert-url"
        })
    });
} else {
    admin.app(); // Usar a instância já inicializada, caso exista
}

const db = admin.firestore(); // Inicializa o Firestore

export { db };
