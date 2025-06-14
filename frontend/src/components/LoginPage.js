import React from "react";
import { useNavigate } from "react-router-dom";

function LoginPage({ formData, onChange, onLogin, switchToRegister }) {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin(e);
    if (success) {
      navigate("/");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="button" onClick={() => navigate("/")}>
        🌿 LOGO
      </button>
      <h2>Logowanie</h2>
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
        type="password"
        name="password"
        placeholder="Hasło"
        value={formData.password}
        onChange={onChange}
        required
      />
      <br />
      <button type="submit">Zaloguj się</button>
      <p>
        Nie masz konta?{" "}
        <button type="button" onClick={switchToRegister}>
          Zarejestruj się
        </button>
      </p>
    </form>
  );
}

export default LoginPage;
