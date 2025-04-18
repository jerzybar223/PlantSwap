import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import UserProfile from "./components/UserProfile";

function HomePage({ user, token }) {
  const navigate = useNavigate();
  const [recentPlants, setRecentPlants] = useState([]);
  const [userPlants, setUserPlants] = useState([]);
  const [selectedPlantToSwap, setSelectedPlantToSwap] = useState(null);
  const [requestedPlant, setRequestedPlant] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/plants/recent/")
      .then((res) => res.json())
      .then((data) => setRecentPlants(data))
      .catch((err) => console.error("Błąd pobierania roślin:", err));
  }, []);

  const openSwapModal = async (plant) => {
    if (!user || !token) return alert("Musisz być zalogowany, by zaproponować wymianę.");

    const res = await fetch("http://localhost:8000/api/user_plants/", {
      headers: { Authorization: `Token ${token}` },
    });

    const data = await res.json();
    setUserPlants(data);
    setRequestedPlant(plant);
  };

  const submitSwap = async () => {
    if (!selectedPlantToSwap || !requestedPlant) return;

    const res = await fetch("http://localhost:8000/api/swaps/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        offered_plant: selectedPlantToSwap.id,
        requested_plant: requestedPlant.id,
      }),
    });

    if (res.ok) {
      alert("Propozycja wymiany została wysłana!");
      setSelectedPlantToSwap(null);
      setRequestedPlant(null);
    } else {
      const err = await res.json();
      alert("Błąd: " + JSON.stringify(err));
    }
  };

  return (
    <div>
      <button onClick={() => navigate("/")}>🌿 LOGO</button>
      {user ? (
        <div>
          <p>Witaj, {user.username}!</p>
          <button onClick={() => navigate("/profile")}>Mój profil</button>
        </div>
      ) : (
        <>
          <button onClick={() => navigate("/login")}>Zaloguj się</button>{" "}
          <button onClick={() => navigate("/register")}>Zarejestruj się</button>
        </>
      )}

      <h2>Ostatnie ogłoszenia:</h2>
      {recentPlants.length === 0 ? (
        <p>Brak ogłoszeń do wyświetlenia.</p>
      ) : (
        <ul>
          {recentPlants.map((plant) => (
            <li key={plant.id}>
              <strong>{plant.name}</strong> – {plant.description}
              {plant.photo_url && (
                <div>
                  <img src={plant.photo_url} alt={plant.name} width="100" />
                </div>
              )}

              {user && plant.user !== user.id && (
                <button onClick={() => openSwapModal(plant)}>Wymień</button>
              )}
            </li>
          ))}
        </ul>
      )}

      {requestedPlant && (
        <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid gray" }}>
          <h3>Proponujesz wymianę za: <strong>{requestedPlant.name}</strong></h3>
          <label>Wybierz jedną ze swoich roślin:</label>
          <select
            value={selectedPlantToSwap?.id || ""}
            onChange={(e) => {
              const selected = userPlants.find((p) => p.id === parseInt(e.target.value));
              setSelectedPlantToSwap(selected);
            }}
          >
            <option value="">-- wybierz --</option>
            {userPlants.map((plant) => (
              <option key={plant.id} value={plant.id}>
                {plant.name}
              </option>
            ))}
          </select>
          <br />
          <button onClick={submitSwap} disabled={!selectedPlantToSwap}>Zaproponuj wymianę</button>{" "}
          <button onClick={() => setRequestedPlant(null)}>Anuluj</button>
        </div>
      )}
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
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
          setLoadingUser(false);
        })
        .catch(() => {
          setToken(null);
          localStorage.removeItem("token");
          setLoadingUser(false);
        });
    } else {
      setLoadingUser(false);
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
  };

  return (
    <Router>
      <div style={{ padding: "2rem" }}>
        <Routes>
          <Route path="/" element={<HomePage user={user} token={token} />} />

          <Route
            path="/login"
            element={
              token && user ? (
                <Navigate to="/" />
              ) : (
                <LoginPage
                  formData={formData}
                  onChange={handleChange}
                  onLogin={handleLogin}
                />
              )
            }
          />

          <Route
            path="/register"
            element={
              token && user ? (
                <Navigate to="/" />
              ) : (
                <RegisterPage
                  formData={formData}
                  onChange={handleChange}
                  onRegister={handleRegister}
                />
              )
            }
          />

          <Route
            path="/profile"
            element={
              loadingUser ? (
                <p>Ładowanie danych użytkownika...</p>
              ) : token && user ? (
                <UserProfile user={user} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
