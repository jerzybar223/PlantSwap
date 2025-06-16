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
            <img src={require("../logoflora.png")} alt="FloraSoft logo" style={{ height: 400, width: "auto", marginRight: 18, position: "absolute", left: 0, top: -145 }} />
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
          onClick={() => navigate("/register")}
        >
          Rejestracja
        </button>
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
        <div style={{ background: "#bfc0c5", height: 110, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px #bbb", marginBottom: 40, position: "relative", overflow: "visible" }}>
          <input
            type="text"
            name="username"
            placeholder="Login"
            value={formData.username}
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
            autoComplete="username"
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
