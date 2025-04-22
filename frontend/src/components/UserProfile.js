import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function UserProfile({ user, onLogout }) {
  const [view, setView] = useState("profile");
  const [editData, setEditData] = useState({ ...user });
  const [plants, setPlants] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [image, setImage] = useState(null); // Stan na obraz
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (view === "swaps") {
      fetch("http://localhost:8000/api/swaps/", {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => res.json())
        .then(setSwaps);
    }

    if (view === "profile") {
      fetch("http://localhost:8000/api/user_plants/", {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => res.json())
        .then(setPlants)
        .catch((err) => {
          console.error("Błąd podczas pobierania roślin:", err);
        });
    }
  }, [view, token]);

  const handleEditChange = (e) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/users/update/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(editData),
    });

    if (res.ok) {
      alert("Dane zaktualizowane.");
    } else {
      alert("Błąd aktualizacji.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const updateSwapStatus = async (swapId, newStatus) => {
    const res = await fetch(`http://localhost:8000/api/swaps/${swapId}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      alert(`Wymiana została ${newStatus === "accepted" ? "zatwierdzona" : "odrzucona"}.`);
      const updated = await fetch("http://localhost:8000/api/swaps/", {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await updated.json();
      setSwaps(data);
    } else {
      alert("Błąd podczas aktualizacji statusu.");
    }
  };

  const handlePlantSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if (image) {
      formData.append("image", image);
    }

    const res = await fetch("http://localhost:8000/api/plants/", {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      alert("Roślina dodana!");
      e.target.reset();
      const updated = await fetch("http://localhost:8000/api/my-plants/", {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await updated.json();
      setPlants(data);
    } else {
      alert("Błąd podczas dodawania rośliny.");
    }
  };

  return (
    <div>
      <button type="button" onClick={() => navigate("/")}>
        🌿 LOGO
      </button>
      <h2>Witaj, {user.username}!</h2>
      <button onClick={onLogout}>Wyloguj się</button>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setView("profile")}>Profil</button>
        <button onClick={() => setView("edit")}>Zmień dane</button>
        <button onClick={() => setView("addPlant")}>Dodaj roślinę</button>
        <button onClick={() => setView("swaps")}>Moje wymiany</button>
      </div>

      {view === "profile" && (
        <div>
          <p>Email: {user.email}</p>
          <p>Lokalizacja: {user.location || "Brak"}</p>
          <p>Ostatnia aktywność: {user.last_activity}</p>

          <h3>Twoje rośliny:</h3>
          {plants.length === 0 ? (
            <p>Nie dodałeś jeszcze żadnych roślin.</p>
          ) : (
            <ul>
              {plants.map((plant) => (
                <li key={plant.id}>
                  <strong>{plant.name}</strong> – {plant.description}
                  {plant.photo_url && (
                    <div>
                      <img
                        src={plant.photo_url}
                        alt={plant.name}
                        width="100"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view === "edit" && (
        <form onSubmit={handleUserUpdate}>
          <h3>Edytuj dane</h3>
          <input
            type="text"
            name="username"
            value={editData.username}
            onChange={handleEditChange}
            placeholder="Nazwa użytkownika"
          />
          <br />
          <input
            type="email"
            name="email"
            value={editData.email}
            onChange={handleEditChange}
            placeholder="Email"
          />
          <br />
          <input
            type="text"
            name="location"
            value={editData.location || ""}
            onChange={handleEditChange}
            placeholder="Lokalizacja"
          />
          <br />
          <button type="submit">Zapisz zmiany</button>
        </form>
      )}

      {view === "addPlant" && (
        <form onSubmit={handlePlantSubmit}>
          <h3>Dodaj nową roślinę</h3>
          <input name="name" placeholder="Nazwa rośliny" required />
          <br />
          <textarea name="description" placeholder="Opis" />
          <br />
          <input type="file" name="image" accept="image/*" onChange={handleImageChange} />
          <br />
          <button type="submit">Dodaj</button>
        </form>
      )}

      {view === "swaps" && (
        <div>
          <h3>Moje wymiany</h3>
          {swaps.length === 0 ? (
            <p>Brak propozycji wymian.</p>
          ) : (
            swaps.map((swap) => (
                <div key={swap.id} style={{border: "1px solid #ccc", marginBottom: "1rem", padding: "1rem"}}>
                  <p>Ty oferujesz: <strong>{swap.offered_plant_name}</strong></p>
                  <p>Ty chcesz: <strong>{swap.requested_plant_name}</strong></p>
                  <p>Status: <strong>{swap.status}</strong></p>

                  { swap.status === "pending" && (
                      <div>
                        <button onClick={() => updateSwapStatus(swap.id, "accepted")}>Zatwierdź</button>
                        {" "}
                        <button onClick={() => updateSwapStatus(swap.id, "rejected")}>Odrzuć</button>
                      </div>
                  )}


                </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default UserProfile;
