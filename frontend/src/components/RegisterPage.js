import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage({ formData, onChange, onRegister }) {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="card p-4" style={{ minWidth: 350, maxWidth: 400 }}>
        <h2 className="mb-4 text-center">Rejestracja</h2>
        <form onSubmit={onRegister}>
          <input
            name="username"
            className="form-control mb-3"
            placeholder="Nazwa użytkownika"
            value={formData.username}
            onChange={onChange}
            required
          />
          <input
            type="email"
            name="email"
            className="form-control mb-3"
            placeholder="Email"
            value={formData.email}
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
          <input
            type="password"
            name="password2"
            className="form-control mb-3"
            placeholder="Powtórz hasło"
            value={formData.password2}
            onChange={onChange}
            required
          />
          <input
            name="location"
            className="form-control mb-3"
            placeholder="Lokalizacja"
            value={formData.location}
            onChange={onChange}
            required
          />
          <button type="submit" className="btn btn-success w-100 mb-2">Zarejestruj się</button>
        </form>
        <div className="text-center mt-2">
          <span>Masz już konto? </span>
          <button type="button" className="btn btn-link p-0" onClick={() => navigate('/login')}>
            Zaloguj się
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
