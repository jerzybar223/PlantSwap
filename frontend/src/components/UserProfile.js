import React from "react";

function UserProfile({ user, onLogout }) {
  return (
    <div>
      <h2>Witaj, {user.username}!</h2>
      <p>Email: {user.email}</p>
      <p>Lokalizacja: {user.location || "Brak"}</p>
      <p>Ostatnia aktywność: {user.last_activity}</p>
      <button onClick={onLogout}>Wyloguj się</button>
    </div>
  );
}

export default UserProfile;
