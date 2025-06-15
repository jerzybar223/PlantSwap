import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MessagesPage({ user, token }) {
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [lastMessageDates, setLastMessageDates] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Pobierz listę użytkowników
      fetch("http://localhost:8000/api/users/", {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          // Filtrujemy siebie z listy
          const filteredUsers = data.filter(u => u.id !== user.id);
          setUsers(filteredUsers);
          
          // Pobierz daty ostatnich wiadomości dla każdego użytkownika
          filteredUsers.forEach(u => {
            fetch(`http://localhost:8000/api/messages/with/${u.id}/`, {
              headers: { Authorization: `Token ${token}` },
            })
              .then((res) => res.json())
              .then((messages) => {
                if (messages.length > 0) {
                  setLastMessageDates(prev => ({
                    ...prev,
                    [u.id]: messages[0].sent_at
                  }));
                }
              });
          });
        });
    }
  }, [token, user]);

  useEffect(() => {
    if (selectedUser) {
      // Pobierz wiadomości z wybranym użytkownikiem
      fetch(`http://localhost:8000/api/messages/with/${selectedUser.id}/`, {
        headers: { Authorization: `Token ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          // Ustawiamy wiadomości od najstarszej do najnowszej
          const sortedMessages = data.sort((a, b) => 
            new Date(a.sent_at) - new Date(b.sent_at)
          );
          setMessages(sortedMessages);
          
          // Aktualizuj datę ostatniej wiadomości
          if (sortedMessages.length > 0) {
            setLastMessageDates(prev => ({
              ...prev,
              [selectedUser.id]: sortedMessages[sortedMessages.length - 1].sent_at
            }));
          }
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
        // Dodajemy nową wiadomość na koniec listy
        setMessages([...messages, sentMessage]);
        // Aktualizujemy datę ostatniej wiadomości
        setLastMessageDates(prev => ({
          ...prev,
          [selectedUser.id]: sentMessage.sent_at
        }));
        setNewMessage("");
      } else {
        alert("Błąd podczas wysyłania wiadomości");
      }
    } catch (error) {
      console.error("Błąd:", error);
      alert("Błąd podczas wysyłania wiadomości");
    }
  };

  if (!user) {
    return <div className="text-center mt-5">Ładowanie wiadomości...</div>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Jeśli wiadomość jest z dzisiaj, pokaż tylko godzinę
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    }
    // Jeśli wiadomość jest z tego tygodnia, pokaż dzień tygodnia i godzinę
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('pl-PL', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
    // W przeciwnym razie pokaż pełną datę
    return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  // Sort users by last message date (descending), users with no messages at the end
  const sortedUsers = [...users].sort((a, b) => {
    const dateA = lastMessageDates[a.id] ? new Date(lastMessageDates[a.id]) : null;
    const dateB = lastMessageDates[b.id] ? new Date(lastMessageDates[b.id]) : null;
    if (dateA && dateB) {
      return dateB - dateA;
    } else if (dateA) {
      return -1;
    } else if (dateB) {
      return 1;
    } else {
      return 0;
    }
  });

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
              {sortedUsers.map((u) => (
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
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{u.location || "Brak lokalizacji"}</small>
                        {lastMessageDates[u.id] && (
                          <small className="text-muted ms-2">
                            {formatDate(lastMessageDates[u.id])}
                          </small>
                        )}
                      </div>
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
                          {formatDate(message.sent_at)}
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