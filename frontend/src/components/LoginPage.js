import React from "react";
import { useNavigate } from "react-router-dom";

function LoginPage({ formData, onChange, onLogin }) {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="card p-4" style={{ minWidth: 350, maxWidth: 400 }}>
        <h2 className="mb-4 text-center">Logowanie</h2>
        <form onSubmit={onLogin}>
          <input
            type="text"
            name="username"
            className="form-control mb-3"
            placeholder="Nazwa użytkownika"
            value={formData.username}
            onChange={onChange}
            required
          />
          <input
            type="password"
            name="password"
            className="form-control mb-3"
            placeholder="Hasło"
            value={formData.password}
            onChange={onChange}
            required
          />
          <button type="submit" className="btn btn-success w-100 mb-2">Zaloguj się</button>
        </form>
        <div className="text-center mt-2">
          <span>Nie masz konta? </span>
          <button type="button" className="btn btn-link p-0" onClick={() => navigate('/register')}>
            Zarejestruj się
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
