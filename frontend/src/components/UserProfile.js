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

  const translateStatus = (status) => {
  switch (status) {
    case "pending":
      return "oczekujące";
    case "accepted":
      return "zaakceptowane";
    case "rejected":
      return "odrzucone";
    default:
      return status;
  }
};


  useEffect(() => {
    if (view === "swaps") {
      fetch("http://localhost:8000/api/swaps/", {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setSwaps(sorted);
        });
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
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4 w-100" style={{ maxWidth: 600 }}>
        <h2 className="mb-4 text-center">Witaj, {user.username}!</h2>
        <button className="btn btn-outline-danger w-100 mb-3" onClick={onLogout}>Wyloguj się</button>
        <div className="d-flex justify-content-center mb-4 flex-wrap gap-2">
          <button className={`btn btn-success${view === 'profile' ? ' active' : ''}`} onClick={() => setView("profile")}>Profil</button>
          <button className={`btn btn-success${view === 'edit' ? ' active' : ''}`} onClick={() => setView("edit")}>Zmień dane</button>
          <button className={`btn btn-success${view === 'addPlant' ? ' active' : ''}`} onClick={() => setView("addPlant")}>Dodaj roślinę</button>
          <button className={`btn btn-success${view === 'swaps' ? ' active' : ''}`} onClick={() => setView("swaps")}>Moje wymiany</button>
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
              <ul className="list-group mb-3">
                {plants.map((plant) => (
                  <li key={plant.id} className="list-group-item d-flex flex-column align-items-center">
                    <strong>{plant.name}</strong> – {plant.description}
                    {plant.photo_url && (
                      <div className="my-2">
                        <img src={plant.photo_url} alt={plant.name} width="100" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {view === "edit" && (
          <form onSubmit={handleUserUpdate} className="mt-3">
            <h3 className="mb-3">Edytuj dane</h3>
            <input type="text" name="username" value={editData.username} onChange={handleEditChange} placeholder="Nazwa użytkownika" className="form-control mb-2" />
            <input type="email" name="email" value={editData.email} onChange={handleEditChange} placeholder="Email" className="form-control mb-2" />
            <input type="text" name="location" value={editData.location || ""} onChange={handleEditChange} placeholder="Lokalizacja" className="form-control mb-2" />
            <button type="submit" className="btn btn-success w-100">Zapisz zmiany</button>
          </form>
        )}
        {view === "addPlant" && (
          <form onSubmit={handlePlantSubmit} className="mt-3">
            <h3 className="mb-3">Dodaj nową roślinę</h3>
            <input name="name" className="form-control mb-2" placeholder="Nazwa rośliny" required />
            <textarea name="description" className="form-control mb-2" placeholder="Opis" />
            <input type="file" name="image" accept="image/*" onChange={handleImageChange} className="form-control mb-2" />
            <button type="submit" className="btn btn-success w-100">Dodaj</button>
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
                    <p>Status: <strong>{translateStatus(swap.status)}</strong></p>


                    {swap.status === "pending" && swap.requested_plant_owner_id === Number(user.id) && (
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
    </div>
  );
}

export default UserProfile;
