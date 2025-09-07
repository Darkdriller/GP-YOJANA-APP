import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing connection...');
  const [authStatus, setAuthStatus] = useState<string>('Checking auth...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Checking Firestore...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Test Firebase Auth connection
    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthStatus(`Auth connected! User: ${user.email || user.uid}`);
        } else {
          setAuthStatus('Auth connected! No user signed in.');
        }
        setConnectionStatus('Firebase connected successfully!');
      }, (error) => {
        setAuthStatus(`Auth error: ${error.message}`);
        setError(error.message);
      });

      // Test Firestore connection
      testFirestore();

      return () => unsubscribe();
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
      setConnectionStatus('Connection failed!');
    }
  }, []);

  const testFirestore = async () => {
    try {
      // Try to access a collection (even if it doesn't exist)
      const testCollection = collection(db, 'test');
      await getDocs(testCollection);
      setFirestoreStatus('Firestore connected successfully!');
    } catch (err: any) {
      setFirestoreStatus(`Firestore error: ${err.message}`);
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Firebase Connection Test</h1>
      
      <div style={{ marginTop: '1rem' }}>
        <h2>Connection Status:</h2>
        <p style={{ 
          color: connectionStatus.includes('successfully') ? 'green' : 
                 connectionStatus.includes('Testing') ? 'orange' : 'red' 
        }}>
          {connectionStatus}
        </p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h2>Auth Status:</h2>
        <p style={{ 
          color: authStatus.includes('connected') ? 'green' : 
                 authStatus.includes('Checking') ? 'orange' : 'red' 
        }}>
          {authStatus}
        </p>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <h2>Firestore Status:</h2>
        <p style={{ 
          color: firestoreStatus.includes('successfully') ? 'green' : 
                 firestoreStatus.includes('Checking') ? 'orange' : 'red' 
        }}>
          {firestoreStatus}
        </p>
      </div>

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffebee', border: '1px solid red' }}>
          <h2>Error Details:</h2>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3>Firebase Config (from environment):</h3>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
{JSON.stringify({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing'
}, null, 2)}
        </pre>
      </div>
    </div>
  );
}