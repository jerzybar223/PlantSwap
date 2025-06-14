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
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm mt-5">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <button 
                  type="button" 
                  className="btn btn-link text-decoration-none" 
                  onClick={() => navigate("/")}
                >
                  <i className="bi bi-flower1 fs-1"></i>
                  <h1 className="h3">PlantSwap</h1>
                </button>
              </div>
              
              <h2 className="text-center mb-4">Logowanie</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    name="username"
                    placeholder="Nazwa użytkownika"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Hasło"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <button type="submit" className="btn btn-primary w-100 mb-3">
                  Zaloguj się
                </button>
                
                <div className="text-center">
                  <p className="mb-0">
                    Nie masz konta?{" "}
                    <button 
                      type="button" 
                      className="btn btn-link p-0" 
                      onClick={() => navigate("/register")}
                    >
                      Zarejestruj się
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
