import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDeWpx8iWZTLItCUgWX8YEST2VpxCyUAjo",
  authDomain: "stockoverflow-814e8.firebaseapp.com",
  projectId: "stockoverflow-814e8",
  storageBucket: "stockoverflow-814e8.firebasestorage.app",
  messagingSenderId: "670690019938",
  appId: "1:670690019938:web:c3b8eb561425523f9edf3b",
  measurementId: "G-4JZ6GF652G"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app; 