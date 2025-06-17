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
    <div style={{ minHeight: "100vh", background: "#ededed" }}>
      {/* Header */}
      <div style={{ background: "#bfc0c5", height: 110, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px 0 40px", boxShadow: "0 2px 8px #bbb", position: "relative", overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={require("./logoflora.png")} alt="FloraSoft logo" style={{ height: 360, width: "auto", marginRight: 18, cursor: "pointer", position: "absolute", left: 0, top: -113 }} onClick={() => navigate("/")} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button
            style={{
              background: "#bfc0c5",
              color: "#fff",
              fontSize: 28,
              border: "none",
              borderRadius: 30,
              padding: "8px 36px",
              fontWeight: 400,
              cursor: "pointer",
              boxShadow: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: 0.7
            }}
            onClick={() => navigate("/messages")}
          >
            <span style={{ fontSize: 28, marginRight: 8 }}>💬</span>Wiadomości
          </button>
          <button
            style={{
              background: "#bfc0c5",
              color: "#fff",
              fontSize: 28,
              border: "none",
              borderRadius: 30,
              padding: "8px 36px",
              fontWeight: 400,
              cursor: "pointer",
              boxShadow: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: 0.7
            }}
            onClick={() => navigate("/profile")}
          >
            <span style={{ fontSize: 28, marginRight: 8 }}>👤</span>Moje Konto
          </button>
          {user && (
            <button
              style={{
                background: "#fff",
                color: "#bfc0c5",
                fontSize: 22,
                border: "1px solid #bfc0c5",
                borderRadius: 18,
                padding: "6px 24px",
                fontWeight: 500,
                cursor: "pointer",
                marginLeft: 18,
                boxShadow: "none",
                transition: "background 0.2s",
              }}
              onClick={onLogout}
            >
              Wyloguj się
            </button>
          )}
        </div>
      </div>

      {/* Main board */}
      <div style={{ maxWidth: 1200, margin: "50px auto 0 auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 40 }}>
          {recentPlants.map((plant) => (
            <div key={plant.id} style={{
              display: "flex",
              alignItems: "center",
              background: "#d6d6d6",
              borderRadius: 48,
              marginBottom: 38,
              padding: 24,
              boxShadow: "none",
              minHeight: 140,
              gap: 24,
              flexWrap: "wrap",
              overflow: "hidden"
            }}>
              {plant.photo_url && (
                <img
                  src={plant.photo_url}
                  alt={plant.name}
                  style={{ width: 120, height: 90, objectFit: "cover", borderRadius: 20, marginRight: 18, flexShrink: 0 }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: "#444", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis" }}>{plant.name}</div>
                <div style={{ fontSize: 18, color: "#555", marginBottom: 8, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis" }}>{plant.description}</div>
                <div style={{ fontSize: 20, color: "#b48e9c", fontWeight: 700, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 20, marginRight: 6 }}>📍</span><span style={{fontWeight: 700}}>{plant.location || "Rzeszów"}</span>
                </div>
              </div>
              {user && plant.user !== user.id && (
                <button
                  onClick={() => openSwapModal(plant)}
                  style={{
                    background: "#b6ef9b",
                    color: "#fff",
                    fontSize: 24,
                    border: "none",
                    borderRadius: 30,
                    padding: "8px 32px",
                    fontWeight: 600,
                    cursor: "pointer",
                    marginLeft: "auto",
                    boxShadow: "none",
                    transition: "background 0.2s",
                    maxWidth: "100%",
                    minWidth: 120,
                    whiteSpace: "nowrap",
                    flexShrink: 0
                  }}
                >
                  Wymień
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {requestedPlant && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0, 0, 0, 0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: 40, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)" }}>
              <div className="modal-header" style={{ background: "#7e8ba3", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: "18px 32px", borderBottom: "none" }}>
                <h5 className="modal-title" style={{ margin: 0, fontSize: 28, color: '#fff', fontWeight: 600 }}>
                  Proponujesz wymianę za: <strong style={{ color: '#fff' }}>{requestedPlant.name}</strong>
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setRequestedPlant(null)}
                  style={{ filter: "invert(1)", opacity: 0.8 }}
                ></button>
              </div>
              <div className="modal-body" style={{ padding: 32, background: "#f7f7fa", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
                <div className="mb-3">
                  <label className="form-label" style={{ fontSize: 22, fontWeight: 500, color: "#444", marginBottom: 10 }}>Wybierz jedną ze swoich roślin:</label>
                  <select
                    className="form-select"
                    value={selectedPlantToSwap?.id || ""}
                    onChange={(e) => {
                      const selected = userPlants.find((p) => p.id === parseInt(e.target.value));
                      setSelectedPlantToSwap(selected);
                    }}
                    style={{
                      fontSize: 22,
                      borderRadius: 18,
                      border: '1.5px solid #7e8ba3',
                      padding: '12px 24px',
                      outline: 'none',
                      fontWeight: 400,
                      background: '#fff',
                      width: '100%',
                      boxShadow: "none"
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
              <div className="modal-footer" style={{ background: "#f7f7fa", borderBottomLeftRadius: 40, borderBottomRightRadius: 40, padding: "24px 32px", borderTop: "none", display: "flex", justifyContent: "flex-end", gap: 15 }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setRequestedPlant(null)}
                  style={{
                    background: "#e57373",
                    color: "#fff",
                    fontSize: 22,
                    border: "none",
                    borderRadius: 18,
                    padding: "12px 36px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "none",
                    transition: "background 0.2s",
                  }}
                >
                  Anuluj
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={submitSwap} 
                  disabled={!selectedPlantToSwap}
                  style={{
                    background: "#7ed957",
                    color: "#fff",
                    fontSize: 22,
                    border: "none",
                    borderRadius: 18,
                    padding: "12px 36px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "none",
                    transition: "background 0.2s",
                    opacity: selectedPlantToSwap ? 1 : 0.7
                  }}
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
        <Route path="/register" element={
          <RegisterPage
            formData={formData}
            onChange={handleChange}
            onRegister={handleRegister}
            switchToLogin={() => navigate("/login")}
          />
        } />
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
