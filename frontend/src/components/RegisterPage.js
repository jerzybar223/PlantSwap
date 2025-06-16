import React from "react";
import { useNavigate } from "react-router-dom";

function RegisterPage({ formData, onChange, onRegister, switchToLogin }) {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onRegister(e);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6f8" }}>
      {/* Top bar */}
      <div style={{
        background: "#bfc0c5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 110,
        padding: "0 60px 0 40px"
      }}>
        <div style={{ display: "flex", alignItems: "center", height: 110 }}>
          {/* Logo placeholder */}
          <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => navigate("/") }>
            <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="45" cy="35" rx="35" ry="22" fill="#b9e3c6" />
              <path d="M45 15 Q52 35 75 35 Q52 35 45 55 Q38 35 15 35 Q38 35 45 15 Z" fill="#a3b6e3" />
            </svg>
            <span style={{ fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: 48, color: '#7ed957', marginLeft: 18, letterSpacing: 2, textShadow: '1px 1px 2px #888' }}>
              FloraSoft
            </span>
          </div>
        </div>
        <button
          style={{
            background: "#bfc0c5",
            color: "#fff",
            fontSize: 44,
            border: "none",
            borderRadius: 36,
            padding: "6px 60px",
            fontWeight: 400,
            cursor: "pointer",
            boxShadow: "none",
            transition: "background 0.2s",
            opacity: 0.7
          }}
          onClick={switchToLogin}
        >
          Zaloguj
        </button>
      </div>

      {/* Registration form */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 1100, margin: "60px auto 0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 60, width: "100%", justifyContent: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 40, width: 420 }}>
            <input
              type="text"
              name="username"
              placeholder="Login"
              value={formData.username}
              onChange={onChange}
              style={{
                width: "100%",
                fontSize: 44,
                borderRadius: 40,
                border: "none",
                background: "#bfc0c5",
                color: "#fff",
                padding: "12px 30px",
                outline: "none",
                fontWeight: 300,
                letterSpacing: 1,
                textAlign: "center"
              }}
              autoComplete="username"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={onChange}
              style={{
                width: "100%",
                fontSize: 44,
                borderRadius: 40,
                border: "none",
                background: "#bfc0c5",
                color: "#fff",
                padding: "12px 30px",
                outline: "none",
                fontWeight: 300,
                letterSpacing: 1,
                textAlign: "center"
              }}
              autoComplete="email"
            />
            <input
              type="text"
              name="location"
              placeholder="Lokalizacja"
              value={formData.location}
              onChange={onChange}
              style={{
                width: "100%",
                fontSize: 44,
                borderRadius: 40,
                border: "none",
                background: "#bfc0c5",
                color: "#fff",
                padding: "12px 30px",
                outline: "none",
                fontWeight: 300,
                letterSpacing: 1,
                textAlign: "center"
              }}
              autoComplete="address-level2"
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 40, width: 420 }}>
            <input
              type="password"
              name="password"
              placeholder="Hasło"
              value={formData.password}
              onChange={onChange}
              style={{
                width: "100%",
                fontSize: 44,
                borderRadius: 40,
                border: "none",
                background: "#bfc0c5",
                color: "#fff",
                padding: "12px 30px",
                outline: "none",
                fontWeight: 300,
                letterSpacing: 1,
                textAlign: "center"
              }}
              autoComplete="new-password"
            />
            <input
              type="password"
              name="password2"
              placeholder="Powtórz Hasło"
              value={formData.password2}
              onChange={onChange}
              style={{
                width: "100%",
                fontSize: 44,
                borderRadius: 40,
                border: "none",
                background: "#bfc0c5",
                color: "#fff",
                padding: "12px 30px",
                outline: "none",
                fontWeight: 300,
                letterSpacing: 1,
                textAlign: "center"
              }}
              autoComplete="new-password"
            />
          </div>
        </div>
        <button
          type="submit"
          style={{
            width: 400,
            fontSize: 48,
            borderRadius: 40,
            border: "none",
            background: "#bfc0c5",
            color: "#fff",
            padding: "12px 0",
            fontWeight: 400,
            cursor: "pointer",
            marginTop: 10,
            boxShadow: "none",
            transition: "background 0.2s",
            opacity: 0.7
          }}
        >
          Rejestracja
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
