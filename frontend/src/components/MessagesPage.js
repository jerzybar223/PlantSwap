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
    <div style={{ minHeight: "100vh", background: "#ededed" }}>
      {/* Header */}
      <div style={{ background: "#bfc0c5", height: 110, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px 0 40px", boxShadow: "0 2px 8px #bbb", position: "relative", overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => navigate("/") }>
          <img src={require("../logoflora.png")} alt="FloraSoft logo" style={{ height: 400, width: "auto", marginRight: 18, position: "absolute", left: 0, top: -145 }} />
        </div>
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
          onClick={() => { localStorage.removeItem('token'); window.location.reload(); }}
        >
          Wyloguj
        </button>
      </div>

      <div className="row" style={{ margin: 0, marginTop: 40, justifyContent: 'center' }}>
        <div className="col-md-4" style={{ minWidth: 340, maxWidth: 400 }}>
          <div style={{ background: "#d6d6d6", borderRadius: 40, boxShadow: "0 2px 8px #bbb", padding: 0 }}>
            <div style={{ background: "#bfc0c5", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: "18px 32px" }}>
              <h5 style={{ margin: 0, fontSize: 28, color: '#fff', fontWeight: 600 }}>Konwersacje</h5>
            </div>
            <div style={{ padding: 0 }}>
              {sortedUsers.map((u) => (
                <button
                  key={u.id}
                  style={{
                    background: selectedUser?.id === u.id ? "#bfc0c5" : "#ededed",
                    color: selectedUser?.id === u.id ? "#fff" : "#888",
                    border: 'none',
                    borderBottom: '1px solid #e0e0e0',
                    width: '100%',
                    textAlign: 'left',
                    padding: '18px 32px',
                    fontSize: 22,
                    fontWeight: 500,
                    borderRadius: 0,
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}
                  onClick={() => setSelectedUser(u)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 22 }}>{u.username}</div>
                      <div style={{ fontSize: 15, color: '#bfc0c5', marginTop: 2 }}>{u.location || "Brak lokalizacji"}</div>
                    </div>
                    {lastMessageDates[u.id] && (
                      <div style={{ fontSize: 15, color: '#bfc0c5', marginLeft: 10 }}>
                        {formatDate(lastMessageDates[u.id])}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-8" style={{ minWidth: 500, maxWidth: 800 }}>
          {selectedUser ? (
            <div style={{ background: "#d6d6d6", borderRadius: 40, boxShadow: "0 2px 8px #bbb" }}>
              <div style={{ background: "#bfc0c5", borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: "18px 32px" }}>
                <h5 style={{ margin: 0, fontSize: 28, color: '#fff', fontWeight: 600 }}>
                  Rozmowa z {selectedUser.username}
                </h5>
              </div>
              <div style={{ padding: 32 }}>
                <div style={{ height: "400px", overflowY: "auto", background: "#ededed", borderRadius: 20, padding: 18, marginBottom: 24 }}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      style={{ display: 'flex', justifyContent: message.sender === user.id ? 'flex-end' : 'flex-start', marginBottom: 18 }}
                    >
                      <div
                        style={{
                          background: message.sender === user.id ? '#7ed957' : '#fff',
                          color: message.sender === user.id ? '#fff' : '#444',
                          borderRadius: 18,
                          padding: '14px 28px',
                          fontSize: 20,
                          maxWidth: '70%',
                          boxShadow: '0 1px 4px #bbb',
                          wordBreak: 'break-word',
                        }}
                      >
                        <div>{message.content}</div>
                        <div style={{ fontSize: 13, color: '#bfc0c5', marginTop: 6, textAlign: 'right' }}>{formatDate(message.sent_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 16 }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Napisz wiadomość..."
                    style={{
                      flex: 1,
                      fontSize: 22,
                      borderRadius: 18,
                      border: '1.5px solid #bfc0c5',
                      padding: '12px 24px',
                      outline: 'none',
                      fontWeight: 400,
                      background: '#fff',
                    }}
                  />
                  <button type="submit" style={{
                    background: '#bfc0c5',
                    color: '#fff',
                    fontSize: 22,
                    border: 'none',
                    borderRadius: 18,
                    padding: '12px 36px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: 'none',
                    transition: 'background 0.2s',
                  }}>
                    Wyślij
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div style={{ background: "#d6d6d6", borderRadius: 40, boxShadow: "0 2px 8px #bbb", padding: 60, textAlign: 'center' }}>
              <h5 style={{ fontSize: 28, color: '#bfc0c5', fontWeight: 600 }}>Wybierz konwersację</h5>
              <p style={{ fontSize: 20, color: '#888' }}>
                Wybierz użytkownika z listy po lewej stronie, aby rozpocząć rozmowę.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage; 