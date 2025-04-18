import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage({ setUser, setToken }) {
  const [formData, setFormData] = useState({
    username: "", email: "", password: "", password2: "", location: ""
  });

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const { username, email, password, password2, location } = formData;

    if (!username || !email || !password || !password2 || !location) {
      alert("Wszystkie pola są wymagane.");
      return;
    }

    if (password !== password2) {
      alert("Hasła muszą być takie same.");
      return;
    }

    const res = await fetch("http://localhost:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    let data;
    try {
      data = await res.json();
    } catch (err) {
      const text = await res.text();
      alert("Błąd odpowiedzi serwera: " + text);
      return;
    }

    if (res.ok) {
      setToken(data.token);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      navigate("/profile");
    } else {
      alert("Rejestracja nieudana: " + JSON.stringify(data));
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <button type="button" onClick={() => navigate("/")}>🌿 LOGO</button>
      <h2>Rejestracja</h2>
      <input name="username" placeholder="Nazwa użytkownika" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
      <br />
      <input type="email" name="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
      <br />
      <input type="password" name="password" placeholder="Hasło" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
      <br />
      <input type="password" name="password2" placeholder="Powtórz hasło" value={formData.password2} onChange={(e) => setFormData({ ...formData, password2: e.target.value })} required />
      <br />
      <input name="location" placeholder="Lokalizacja" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
      <br />
      <button type="submit">Zarejestruj się</button>
      <p>Masz już konto? <button type="button" onClick={() => navigate("/login")}>Zaloguj się</button></p>
    </form>
  );
}

export default RegisterPage;
