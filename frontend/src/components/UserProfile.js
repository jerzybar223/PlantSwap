import React, { useState, useEffect } from "react";

function UserProfile({ user, onLogout }) {
  const [view, setView] = useState("profile");
  const [editData, setEditData] = useState({ ...user });
  const [plants, setPlants] = useState([]);
  const [swaps, setSwaps] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (view === "swaps") {
      fetch("http://localhost:8000/api/swaps/", {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => res.json())
        .then(setSwaps);
    }
  }, [view]);

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

  const handlePlantSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/plants/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify({
        name: e.target.name.value,
        description: e.target.description.value,
        photo_url: e.target.photo_url.value,
      }),
    });

    if (res.ok) {
      alert("Roślina dodana!");
      e.target.reset();
    } else {
      alert("Błąd podczas dodawania rośliny.");
    }
  };

  return (
    <div>
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
          <input name="photo_url" placeholder="URL zdjęcia" />
          <br />
          <button type="submit">Dodaj</button>
        </form>
      )}

      {view === "swaps" && (
        <div>
          <h3>Propozycje wymian</h3>
          {swaps.length === 0 ? (
            <p>Brak propozycji wymian.</p>
          ) : (
            swaps.map((swap) => (
              <div key={swap.id}>
                <p>
                  Ty oferujesz: <strong>{swap.offered_plant_name}</strong>
                </p>
                <p>
                  Ty chcesz: <strong>{swap.requested_plant_name}</strong>
                </p>
                <p>Status: {swap.status}</p>
                <hr />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default UserProfile;
