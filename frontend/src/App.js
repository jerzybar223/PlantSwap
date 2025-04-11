import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endpointInfo, setEndpointInfo] = useState(null);

  useEffect(() => {
    const testEndpoint = async () => {
      try {
        // Test 1: Sprawdź czy backend odpowiada
        const baseResponse = await axios.get('http://localhost:8000/');
        console.log('Base response:', baseResponse.data);

        // Test 2: Sprawdź czy API root istnieje
        try {
          const apiRootResponse = await axios.get('http://localhost:8000/api/');
          console.log('API root response:', apiRootResponse.data);
        } catch (apiRootError) {
          console.log('API root nie odpowiada - to może być normalne');
        }

        // Test 3: Spróbuj pobrać użytkownika
        const userResponse = await axios.get('http://localhost:8000/api/users/1/');
        setUser(userResponse.data);
      } catch (err) {
        console.error('Full error:', err);
        console.error('Error response:', err.response);

        setError({
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          config: {
            url: err.config?.url,
            method: err.config?.method
          }
        });
      } finally {
        setLoading(false);
      }
    };

    testEndpoint();
  }, []);

  if (loading) {
    return <div className="App">Ładowanie danych...</div>;
  }

  if (error) {
    return (
      <div className="App" style={{ textAlign: 'left', padding: '20px' }}>
        <h1>Błąd połączenia z API</h1>
        <h2>Szczegóły błędu:</h2>
        <p><strong>URL:</strong> {error.config?.url}</p>
        <p><strong>Metoda:</strong> {error.config?.method}</p>
        <p><strong>Status:</strong> {error.status || 'Brak odpowiedzi'}</p>
        <p><strong>Komunikat:</strong> {error.message}</p>

        {error.data && (
          <div>
            <h3>Odpowiedź serwera:</h3>
            <pre>{JSON.stringify(error.data, null, 2)}</pre>
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="App">
      <header className="Aplikacja">
        <h1>Testowanie API</h1>
        {user ? (
          <div>
            <h2>Użytkownik o ID=1:</h2>
            <p><strong>Nazwa:</strong> {user.username}</p>
            <p><strong>email:</strong> {user.email}</p>
          </div>
        ) : (
          <p>Użytkownik został pobrany, ale dane są puste</p>
        )}
      </header>
    </div>
  );
}

export default App;