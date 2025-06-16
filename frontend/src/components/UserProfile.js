import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserProfile({ user, token, onLogout }) {
  const [view, setView] = useState("profile");
  const [editData, setEditData] = useState({ ...user });
  const [plants, setPlants] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Pobierz rośliny użytkownika
      fetch("http://localhost:8000/api/user_plants/", {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setPlants(data))
        .catch((err) => console.error("Błąd pobierania roślin:", err));

      // Pobierz wymiany użytkownika
      fetch("http://localhost:8000/api/swaps/", {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setSwaps(data))
        .catch((err) => console.error("Błąd pobierania wymian:", err));
    }
  }, [token, user]);

  const translateStatus = (status) => {
    const statusMap = {
      pending: "Oczekująca",
      accepted: "Zaakceptowana",
      rejected: "Odrzucona",
    };
    return statusMap[status] || status;
  };

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", editData.username);
    formData.append("email", editData.email);
    formData.append("location", editData.location);
    if (image) {
      formData.append("photo", image);
    }

    try {
      const res = await fetch("http://localhost:8000/api/users/update/", {
        method: "PUT",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setEditData(data);
        alert("Profil zaktualizowany!");
      } else {
        const error = await res.json();
        alert("Błąd: " + JSON.stringify(error));
      }
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd podczas aktualizacji profilu");
    }
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", editData.plantName);
    formData.append("description", editData.plantDescription);
    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await fetch("http://localhost:8000/api/plants/", {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });

      if (res.ok) {
        const newPlant = await res.json();
        setPlants([...plants, newPlant]);
        setEditData({ ...editData, plantName: "", plantDescription: "" });
        setImage(null);
        alert("Roślina dodana!");
      } else {
        const error = await res.json();
        alert("Błąd: " + JSON.stringify(error));
      }
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd podczas dodawania rośliny");
    }
  };

  const handleSwapAction = async (swapId, action) => {
    try {
      const res = await fetch(`http://localhost:8000/api/swaps/${swapId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ status: action }),
      });

      if (res.ok) {
        const updatedSwap = await res.json();
        setSwaps(swaps.map((s) => (s.id === swapId ? updatedSwap : s)));
        alert(`Wymiana ${action === "accepted" ? "zaakceptowana" : "odrzucona"}!`);
      } else {
        const error = await res.json();
        alert("Błąd: " + JSON.stringify(error));
      }
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd podczas aktualizacji wymiany");
    }
  };

  if (!user) {
    return <div className="text-center mt-5">Ładowanie profilu...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ededed" }}>
      {/* Header */}
      <div style={{ background: "#bfc0c5", height: 110, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px 0 40px", boxShadow: "0 2px 8px #bbb" }}>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => navigate("/") }>
          <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="45" cy="35" rx="35" ry="22" fill="#b9e3c6" />
            <path d="M45 15 Q52 35 75 35 Q52 35 45 55 Q38 35 15 35 Q38 35 45 15 Z" fill="#a3b6e3" />
          </svg>
          <span style={{ fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: 48, color: '#7ed957', marginLeft: 18, letterSpacing: 2, textShadow: '1px 1px 2px #888' }}>
            FloraSoft
          </span>
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
            onClick={() => setView("edit")}
          >
            Zmień dane
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
            onClick={() => setView("swaps")}
          >
            Moje wymiany
          </button>
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
            Wyloguj
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 40, marginTop: 50 }}>
        {/* Main rounded box */}
        <div style={{ background: "#d6d6d6", borderRadius: 60, padding: 40, minWidth: 800, maxWidth: 900, flex: 1, boxShadow: "0 2px 8px #bbb" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
            <span style={{ fontSize: 38, background: "#bfc0c5", color: "#fff", borderRadius: 30, padding: "4px 32px", fontWeight: 600, display: "flex", alignItems: "center" }}>😊 {user.username}</span>
          </div>
          <div style={{ fontSize: 24, color: "#555", fontWeight: 400, marginBottom: 18 }}>Moje Rośliny</div>
          <div style={{ background: "#ededed", borderRadius: 12, padding: 24, minHeight: 220, border: "1.5px solid #bbb", marginBottom: 18 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
              {plants.map((plant) => (
                <div key={plant.id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  {plant.photo_url && (
                    <img src={plant.photo_url} alt={plant.name} style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 16, marginBottom: 8 }} />
                  )}
                  <div style={{ fontSize: 20, color: "#444", fontWeight: 500, marginTop: 4 }}>{plant.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, minWidth: 320, alignItems: "center", marginTop: 20 }}>
          <button
            style={{
              background: "#bfc0c5",
              color: "#fff",
              fontSize: 38,
              border: "none",
              borderRadius: 36,
              padding: "16px 40px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "none",
              transition: "background 0.2s",
              opacity: 0.7,
              width: 320,
              marginBottom: 20
            }}
            onClick={() => setView("addPlant")}
          >
            <span style={{ fontSize: 38, marginRight: 12 }}>＋</span>Dodaj ogłoszenie
          </button>
          <button
            style={{
              background: "#bfc0c5",
              color: "#fff",
              fontSize: 38,
              border: "none",
              borderRadius: 36,
              padding: "16px 40px",
              fontWeight: 600,
              cursor: "not-allowed",
              boxShadow: "none",
              transition: "background 0.2s",
              opacity: 0.7,
              width: 320
            }}
            disabled
          >
            <span style={{ fontSize: 38, marginRight: 12 }}>♕</span>Pomoc
          </button>
        </div>
      </div>

      {/* Pozostałe widoki (edycja, dodawanie, wymiany) */}
      {view === "edit" && (
        <div style={{ maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 24, boxShadow: "0 2px 8px #bbb", padding: 32 }}>
          <h3 style={{ fontSize: 32, fontWeight: 600, marginBottom: 24 }}>Edytuj dane</h3>
          <form onSubmit={handleEditSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Nazwa użytkownika</label>
              <input
                type="text"
                name="username"
                value={editData.username}
                onChange={handleEditChange}
                style={{ width: "100%", fontSize: 22, borderRadius: 16, border: "1.5px solid #bfc0c5", padding: "8px 18px", marginTop: 6 }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Email</label>
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleEditChange}
                style={{ width: "100%", fontSize: 22, borderRadius: 16, border: "1.5px solid #bfc0c5", padding: "8px 18px", marginTop: 6 }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Lokalizacja</label>
              <input
                type="text"
                name="location"
                value={editData.location || ""}
                onChange={handleEditChange}
                style={{ width: "100%", fontSize: 22, borderRadius: 16, border: "1.5px solid #bfc0c5", padding: "8px 18px", marginTop: 6 }}
              />
            </div>
            <button type="submit" style={{ fontSize: 24, borderRadius: 16, background: "#bfc0c5", color: "#fff", border: "none", padding: "10px 36px", fontWeight: 600, marginTop: 10 }}>Zapisz zmiany</button>
          </form>
        </div>
      )}
      {view === "addPlant" && (
        <div style={{ maxWidth: 600, margin: "40px auto", background: "#fff", borderRadius: 24, boxShadow: "0 2px 8px #bbb", padding: 32 }}>
          <h3 style={{ fontSize: 32, fontWeight: 600, marginBottom: 24 }}>Dodaj nową roślinę</h3>
          <form onSubmit={handleAddPlant}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Nazwa rośliny</label>
              <input
                name="plantName"
                className="form-control"
                placeholder="Nazwa rośliny"
                required
                value={editData.plantName || ""}
                onChange={handleEditChange}
                style={{ width: "100%", fontSize: 22, borderRadius: 16, border: "1.5px solid #bfc0c5", padding: "8px 18px", marginTop: 6 }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Opis</label>
              <textarea
                name="plantDescription"
                className="form-control"
                placeholder="Opis"
                value={editData.plantDescription || ""}
                onChange={handleEditChange}
                style={{ width: "100%", fontSize: 22, borderRadius: 16, border: "1.5px solid #bfc0c5", padding: "8px 18px", marginTop: 6 }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontWeight: 500 }}>Zdjęcie</label>
              <input
                type="file"
                className="form-control"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                style={{ width: "100%", fontSize: 22, borderRadius: 16, border: "1.5px solid #bfc0c5", padding: "8px 18px", marginTop: 6 }}
              />
            </div>
            <button type="submit" style={{ fontSize: 24, borderRadius: 16, background: "#bfc0c5", color: "#fff", border: "none", padding: "10px 36px", fontWeight: 600, marginTop: 10 }}>Dodaj</button>
          </form>
        </div>
      )}
      {view === "swaps" && (
        <div style={{ maxWidth: 700, margin: "40px auto", background: "#fff", borderRadius: 24, boxShadow: "0 2px 8px #bbb", padding: 32 }}>
          <h3 style={{ fontSize: 32, fontWeight: 600, marginBottom: 24 }}>Moje wymiany</h3>
          {swaps.length === 0 ? (
            <div style={{ fontSize: 20, color: "#888" }}>Brak propozycji wymian.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {swaps.map((swap) => (
                <div key={swap.id} style={{ background: "#ededed", borderRadius: 16, padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 20 }}>Wymiana #{swap.id}</div>
                    <div><strong>Oferujesz:</strong> {swap.offered_plant_name}</div>
                    <div><strong>Chcesz otrzymać:</strong> {swap.requested_plant_name}</div>
                    <div><strong>Status:</strong> {translateStatus(swap.status)}</div>
                    <div><strong>Data:</strong> {new Date(swap.created_at).toLocaleDateString()}</div>
                  </div>
                  {swap.status === "pending" && swap.requested_plant_owner_id === Number(user.id) && (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        style={{ background: "#7ed957", color: "#fff", border: "none", borderRadius: 10, padding: "8px 24px", fontWeight: 600, fontSize: 18, cursor: "pointer" }}
                        onClick={() => handleSwapAction(swap.id, "accepted")}
                      >
                        Akceptuj
                      </button>
                      <button
                        style={{ background: "#e57373", color: "#fff", border: "none", borderRadius: 10, padding: "8px 24px", fontWeight: 600, fontSize: 18, cursor: "pointer" }}
                        onClick={() => handleSwapAction(swap.id, "rejected")}
                      >
                        Odrzuć
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserProfile;
