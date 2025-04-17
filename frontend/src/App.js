import React, { useState, useEffect } from "react";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import UserProfile from "./components/UserProfile";

function App() {
  const [view, setView] = useState("home");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    location: "",
  });

  useEffect(() => {
    if (token) {
      fetch("http://localhost:8000/api/users/current_user/", {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => {
          if (res.status === 401) throw new Error("Unauthorized");
          return res.json();
        })
        .then((data) => {
          setUser(data);
          setView("dashboard");
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, [token]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
      body: JSON.stringify({ username, email, password, password2, location }),
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
      setView("dashboard");
    } else {
      alert("Rejestracja nieudana: " + JSON.stringify(data));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      alert("Podaj nazwę użytkownika i hasło.");
      return;
    }

    const res = await fetch("http://localhost:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
      }),
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
      setView("dashboard");
    } else {
      alert("Logowanie nieudane: " + JSON.stringify(data));
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    setFormData({
      username: "",
      email: "",
      password: "",
      password2: "",
      location: "",
    });
    setView("home");
  };

  return (
    <div style={{ padding: "2rem" }}>
      {view === "home" && (
        <div>
          <h1>Witamy w naszej aplikacji!</h1>
          <button onClick={() => setView("login")}>Zaloguj się</button>{" "}
          <button onClick={() => setView("register")}>Zarejestruj się</button>
        </div>
      )}

      {view === "login" && (
        <LoginPage
          formData={formData}
          onChange={handleChange}
          onLogin={handleLogin}
          switchToRegister={() => setView("register")}
          backToHome={() => setView("home")}
        />
      )}

      {view === "register" && (
        <RegisterPage
          formData={formData}
          onChange={handleChange}
          onRegister={handleRegister}
          switchToLogin={() => setView("login")}
          backToHome={() => setView("home")}
        />
      )}

      {view === "dashboard" && user && (
        <UserProfile user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
