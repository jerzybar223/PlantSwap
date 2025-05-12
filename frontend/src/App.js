import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Link } from "react-router-dom";
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
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      {user ? (
        <div className="mb-3 text-center">
          <p>Witaj, {user.username}!</p>
          <button className="btn btn-success mx-1" onClick={() => navigate("/profile")}>Mój profil</button>
        </div>
      ) : (
        <div className="mb-3 text-center">
          <button className="btn btn-success mx-1" onClick={() => navigate("/login")}>Zaloguj się</button>
          <button className="btn btn-success mx-1" onClick={() => navigate("/register")}>Zarejestruj się</button>
        </div>
      )}

      <h2 className="mb-4">Ostatnie ogłoszenia:</h2>
      {recentPlants.length === 0 ? (
        <p>Brak ogłoszeń do wyświetlenia.</p>
      ) : (
        <ul className="list-group mb-4" style={{ maxWidth: 600 }}>
          {recentPlants.map((plant) => (
            <li key={plant.id} className="list-group-item d-flex flex-column align-items-center">
              <strong>{plant.name}</strong> – {plant.description}
              {plant.photo_url && (
                <div className="my-2">
                  <img src={plant.photo_url} alt={plant.name} width="100" />
                </div>
              )}

              {user && plant.user !== user.id && (
                <button className="btn btn-success mt-2" onClick={() => openSwapModal(plant)}>Wymień</button>
              )}
            </li>
          ))}
        </ul>
      )}

      {requestedPlant && (
        <div className="card p-3 mt-4" style={{ maxWidth: 500 }}>
          <h3 className="mb-3">Proponujesz wymianę za: <strong>{requestedPlant.name}</strong></h3>
          <label className="mb-2">Wybierz jedną ze swoich roślin:</label>
          <select
            className="form-select mb-3"
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
          <div className="d-flex justify-content-between">
            <button className="btn btn-success" onClick={submitSwap} disabled={!selectedPlantToSwap}>Zaproponuj wymianę</button>
            <button className="btn btn-outline-danger" onClick={() => setRequestedPlant(null)}>Anuluj</button>
          </div>
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
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            <span role="img" aria-label="logo" style={{ fontSize: '2rem', marginRight: '0.5rem' }}>🌿</span>
            PlantSwap
          </Link>
        </div>
      </nav>
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
