// Login.js
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Form from "./Form";
import { CurrentUserContext } from "../context/CurrentContextUser";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(CurrentUserContext);

  const handleSubmit = (formData) => {
    login(formData)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Login error:", error);
      });
  };

  return (
    <div className="register__container">
      <Form type="login" onSubmit={handleSubmit} />
    </div>
  );
}

export default Login;
