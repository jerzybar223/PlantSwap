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
      const updated = await fetch("http://localhost:8000/api/user_plants/", {
        headers: { Authorization: `Token ${token}` },
      });
      const data = await updated.json();
      setPlants(data);
    } else {
      alert("Błąd podczas dodawania rośliny.");
    }
  };

  const sendTestMessage = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/messages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          Authorization: `Token ${token}` },
        body: JSON.stringify({
          sender: 1,
          receiver: 2,
          content: 'Testowa wiadomość z frontu!'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Wysłano!', data);
      } else {
        const errorData = await response.json();
        console.error('Błąd:', errorData);
      }
    } catch (error) {
      console.error('Błąd połączenia:', error);
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
            <button 
              className="btn btn-outline-danger" 
              onClick={onLogout}
            >
              Wyloguj się
            </button>
          </div>
        </div>
      </nav>

      <div className="row">
        <div className="col-md-3">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Witaj, {user.username}!</h5>
              <div className="d-grid gap-2">
                <button 
                  className={`btn ${view === "profile" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setView("profile")}
                >
                  Profil
                </button>
                <button 
                  className={`btn ${view === "edit" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setView("edit")}
                >
                  Zmień dane
                </button>
                <button 
                  className={`btn ${view === "addPlant" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setView("addPlant")}
                >
                  Dodaj roślinę
                </button>
                <button 
                  className={`btn ${view === "swaps" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setView("swaps")}
                >
                  Moje wymiany
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          {view === "profile" && (
            <div className="card">
              <div className="card-body">
                <h3 className="card-title mb-4">Informacje o profilu</h3>
                <div className="mb-3">
                  <p className="mb-1"><strong>Email:</strong> {user.email}</p>
                  <p className="mb-1"><strong>Lokalizacja:</strong> {user.location || "Brak"}</p>
                  <p className="mb-1"><strong>Ostatnia aktywność:</strong> {user.last_activity}</p>
                </div>

                <h4 className="mt-4 mb-3">Twoje rośliny</h4>
                {plants.length === 0 ? (
                  <div className="alert alert-info">
                    Nie dodałeś jeszcze żadnych roślin.
                  </div>
                ) : (
                  <div className="row row-cols-1 row-cols-md-2 g-4">
                    {plants.map((plant) => (
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
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "edit" && (
            <div className="card">
              <div className="card-body">
                <h3 className="card-title mb-4">Edytuj dane</h3>
                <form onSubmit={handleUserUpdate}>
                  <div className="mb-3">
                    <label className="form-label">Nazwa użytkownika</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={editData.username}
                      onChange={handleEditChange}
                      placeholder="Nazwa użytkownika"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editData.email}
                      onChange={handleEditChange}
                      placeholder="Email"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Lokalizacja</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={editData.location || ""}
                      onChange={handleEditChange}
                      placeholder="Lokalizacja"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Zapisz zmiany
                  </button>
                </form>
              </div>
            </div>
          )}

          {view === "addPlant" && (
            <div className="card">
              <div className="card-body">
                <h3 className="card-title mb-4">Dodaj nową roślinę</h3>
                <form onSubmit={handlePlantSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nazwa rośliny</label>
                    <input 
                      name="name" 
                      className="form-control"
                      placeholder="Nazwa rośliny" 
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Opis</label>
                    <textarea 
                      name="description" 
                      className="form-control"
                      placeholder="Opis" 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Zdjęcie</label>
                    <input 
                      type="file" 
                      className="form-control"
                      name="image" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Dodaj
                  </button>
                </form>
              </div>
            </div>
          )}

          {view === "swaps" && (
            <div className="card">
              <div className="card-body">
                <h3 className="card-title mb-4">Moje wymiany</h3>
                {swaps.length === 0 ? (
                  <div className="alert alert-info">
                    Brak propozycji wymian.
                  </div>
                ) : (
                  <div className="list-group">
                    {swaps.map((swap) => (
                      <div key={swap.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-1">Wymiana #{swap.id}</h5>
                            <p className="mb-1">
                              <strong>Status:</strong> {translateStatus(swap.status)}
                            </p>
                            <p className="mb-1">
                              <strong>Data:</strong> {new Date(swap.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          {swap.status === "pending" && (
                            <div className="btn-group">
                              <button
                                className="btn btn-success"
                                onClick={() => updateSwapStatus(swap.id, "accepted")}
                              >
                                Akceptuj
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => updateSwapStatus(swap.id, "rejected")}
                              >
                                Odrzuć
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
