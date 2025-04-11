import React, { useState, useEffect } from "react";

function App() {
  const [view, setView] = useState("login");
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
        headers: {
          Authorization: `Token ${token}`,
        },
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
    body: JSON.stringify({
      username,
      email,
      password,
      password2, // <-- TO BYŁO POMIJANE, MUSI BYĆ!
      location,
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
    setView("login");
  };

  return (
    <div style={{ padding: "2rem" }}>
      {view === "login" && (
        <form onSubmit={handleLogin}>
          <h2>Logowanie</h2>
          <input
            type="text"
            name="username"
            placeholder="Nazwa użytkownika"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="password"
            name="password"
            placeholder="Hasło"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <br />
          <button type="submit">Zaloguj się</button>
          <p>
            Nie masz konta?{" "}
            <button type="button" onClick={() => setView("register")}>
              Zarejestruj się
            </button>
          </p>
        </form>
      )}

      {view === "register" && (
        <form onSubmit={handleRegister}>
          <h2>Rejestracja</h2>
          <input
            type="text"
            name="username"
            placeholder="Nazwa użytkownika"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="password"
            name="password"
            placeholder="Hasło"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="password"
            name="password2"
            placeholder="Powtórz hasło"
            value={formData.password2}
            onChange={handleChange}
            required
          />
          <br />
          <input
            type="text"
            name="location"
            placeholder="Lokalizacja"
            value={formData.location}
            onChange={handleChange}
            required
          />
          <br />
          <button type="submit">Zarejestruj się</button>
          <p>
            Masz już konto?{" "}
            <button type="button" onClick={() => setView("login")}>
              Zaloguj się
            </button>
          </p>
        </form>
      )}

      {view === "dashboard" && user && (
        <div>
          <h2>Witaj, {user.username}!</h2>
          <p>Email: {user.email}</p>
          <p>Lokalizacja: {user.location || "Brak"}</p>
          <p>Ostatnia aktywność: {user.last_activity}</p>
          <button onClick={handleLogout}>Wyloguj się</button>
        </div>
      )}
    </div>
  );
}

export default App;
