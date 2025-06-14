import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MessagesPage({ user, token }) {
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Pobierz listę użytkowników
    fetch("http://localhost:8000/api/users/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        // Filtrujemy siebie z listy
        setUsers(data.filter(u => u.id !== user.id));
      });
  }, [token, user.id]);

  useEffect(() => {
    if (selectedUser) {
      // Pobierz wiadomości z wybranym użytkownikiem
      fetch(`http://localhost:8000/api/messages/with/${selectedUser.id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setMessages(data);
        });
    }
  }, [selectedUser, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await fetch("http://localhost:8000/api/messages/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
          receiver: selectedUser.id,
          content: newMessage,
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages([...messages, sentMessage]);
        setNewMessage("");
      } else {
        alert("Błąd podczas wysyłania wiadomości");
      }
    } catch (error) {
      console.error("Błąd:", error);
      alert("Błąd podczas wysyłania wiadomości");
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
        </div>
      </nav>

      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Konwersacje</h5>
            </div>
            <div className="list-group list-group-flush">
              {users.map((u) => (
                <button
                  key={u.id}
                  className={`list-group-item list-group-item-action ${
                    selectedUser?.id === u.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedUser(u)}
                >
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="mb-0">{u.username}</h6>
                      <small className="text-muted">{u.location || "Brak lokalizacji"}</small>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-8">
          {selectedUser ? (
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Rozmowa z {selectedUser.username}
                </h5>
              </div>
              <div className="card-body">
                <div className="messages-container" style={{ height: "400px", overflowY: "auto" }}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`d-flex mb-3 ${
                        message.sender === user.id ? "justify-content-end" : "justify-content-start"
                      }`}
                    >
                      <div
                        className={`message p-3 rounded ${
                          message.sender === user.id
                            ? "bg-primary text-white"
                            : "bg-light"
                        }`}
                        style={{ maxWidth: "70%" }}
                      >
                        <div className="message-content">{message.content}</div>
                        <small className="text-muted d-block mt-1">
                          {new Date(message.sent_at).toLocaleString()}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="mt-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Napisz wiadomość..."
                    />
                    <button type="submit" className="btn btn-primary">
                      Wyślij
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body text-center">
                <h5 className="card-title">Wybierz konwersację</h5>
                <p className="card-text">
                  Wybierz użytkownika z listy po lewej stronie, aby rozpocząć rozmowę.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage; 