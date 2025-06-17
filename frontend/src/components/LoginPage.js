import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await onLogin(formData);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6f8" }}>
      {/* Top bar */}
      <div style={{ background: "#bfc0c5", height: 110, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 60px 0 40px", boxShadow: "0 2px 8px #bbb", position: "relative", overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => navigate("/") }>
          <img src={require("../logoflora.png")} alt="FloraSoft logo" style={{ height: 360, width: "auto", marginRight: 18, position: "absolute", left: 0, top: -113 }} />
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
            onClick={() => navigate("/register")}
          >
            <span style={{ fontSize: 28, marginRight: 8 }}>💬</span>Rejestracja
          </button>
        </div>
      </div>

      {/* Login form */}
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 600,
          margin: "60px auto 0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          name="username"
          placeholder="Login"
          value={formData.username}
          onChange={handleChange}
          style={{
            width: 400,
            fontSize: 48,
            borderRadius: 55,
            border: "none",
            background: "#bfc0c5",
            color: "#fff",
            marginBottom: 40,
            padding: "24px 30px",
            outline: "none",
            fontWeight: 300,
            letterSpacing: 1,
            textAlign: "center",
            boxShadow: "0 2px 8px #bbb",
            display: "block"
          }}
          autoComplete="username"
        />
        <div style={{ position: "relative", width: 400 }}>
          <input
            type="password"
            name="password"
            placeholder="Hasło"
            value={formData.password}
            onChange={handleChange}
            style={{
              width: 400,
              fontSize: 48,
              borderRadius: 40,
              border: "none",
              background: "#bfc0c5",
              color: "#fff",
              marginBottom: 40,
              padding: "12px 30px",
              outline: "none",
              fontWeight: 300,
              letterSpacing: 1,
              textAlign: "center"
            }}
            autoComplete="current-password"
          />
          <span style={{
            position: "absolute",
            right: 30,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#bfc0c5",
            fontSize: 24,
            pointerEvents: "none",
          }}>
            Nowe Hasło
          </span>
        </div>
        <button
          type="submit"
          style={{
            width: 300,
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
          Zaloguj
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
