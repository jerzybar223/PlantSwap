import React from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage({ formData, onChange, onRegister, switchToLogin }) {
  const navigate = useNavigate();

  return (
    <form onSubmit={onRegister}>
      <button type="button" onClick={() => navigate("/")}>
        🌿 LOGO
      </button>
      <h2>Rejestracja</h2>
      <input
        type="text"
        name="username"
        placeholder="Nazwa użytkownika"
        value={formData.username}
        onChange={onChange}
        required
      />
      <br />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={onChange}
        required
      />
      <br />
      <input
        type="password"
        name="password"
        placeholder="Hasło"
        value={formData.password}
        onChange={onChange}
        required
      />
      <br />
      <input
        type="password"
        name="password2"
        placeholder="Powtórz hasło"
        value={formData.password2}
        onChange={onChange}
        required
      />
      <br />
      <input
        type="text"
        name="location"
        placeholder="Lokalizacja"
        value={formData.location}
        onChange={onChange}
        required
      />
      <br />
      <button type="submit">Zarejestruj się</button>
      <p>
        Masz już konto?{" "}
        <button type="button" onClick={switchToLogin}>
          Zaloguj się
        </button>
      </p>
    </form>
  );
}

export default RegisterPage;
