import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import UserProfile from "./components/UserProfile";
import MessagesPage from "./components/MessagesPage";

function HomePage({ user, token, onLogout }) {
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
    <div className="container py-4">
      <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4">
        <div className="container-fluid">
          <button 
            className="btn btn-link text-decoration-none" 
            onClick={() => navigate("/")}
          >
            <i className="bi bi-flower1 fs-1"></i>
            <span className="h3 ms-2">PlantSwap</span>
          </button>
          
          <div className="ms-auto">
            {user ? (
              <div className="d-flex align-items-center">
                <span className="me-3">Witaj, {user.username}!</span>
                <button 
                  className="btn btn-outline-primary me-2" 
                  onClick={() => navigate("/messages")}
                >
                  <i className="bi bi-chat-dots me-1"></i>
                  Wiadomości
                </button>
                <button 
                  className="btn btn-outline-primary me-2" 
                  onClick={() => navigate("/profile")}
                >
                  Mój profil
                </button>
                <button 
                  className="btn btn-outline-danger" 
                  onClick={onLogout}
                >
                  Wyloguj się
                </button>
              </div>
            ) : (
              <div>
                <button 
                  className="btn btn-outline-primary me-2" 
                  onClick={() => navigate("/login")}
                >
                  Zaloguj się
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => navigate("/register")}
                >
                  Zarejestruj się
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <h2 className="mb-4">Ostatnie ogłoszenia:</h2>
      
      {recentPlants.length === 0 ? (
        <div className="alert alert-info">
          Brak ogłoszeń do wyświetlenia.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {recentPlants.map((plant) => (
            <div key={plant.id} className="col">
              <div className="card h-100">
                {plant.photo_url && (
                  <img 
                    src={plant.photo_url} 
                    className="card-img-top" 
                    alt={plant.name} 
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <h5 className="card-title">{plant.name}</h5>
                  <p className="card-text">{plant.description}</p>
                  {user && plant.user !== user.id && (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => openSwapModal(plant)}
                    >
                      Wymień
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {requestedPlant && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Proponujesz wymianę za: <strong>{requestedPlant.name}</strong>
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setRequestedPlant(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Wybierz jedną ze swoich roślin:</label>
                  <select
                    className="form-select"
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
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setRequestedPlant(null)}
                >
                  Anuluj
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={submitSwap} 
                  disabled={!selectedPlantToSwap}
                >
                  Zaproponuj wymianę
                </button>
              </div>
            </div>
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
  const navigate = useNavigate();

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

  const handleLogin = async (formData) => {
    try {
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "User-Agent": "PlantSwap-Web"
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        localStorage.setItem("token", data.token);
        return true;
      } else {
        const error = await res.json();
        alert("Błąd logowania: " + JSON.stringify(error));
        return false;
      }
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd podczas logowania");
      return false;
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
    <div style={{ padding: "2rem" }}>
      <Routes>
        <Route path="/" element={<HomePage user={user} token={token} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
        <Route
          path="/profile"
          element={
            token ? (
              <UserProfile user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/messages"
          element={
            token ? (
              <MessagesPage user={user} token={token} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
