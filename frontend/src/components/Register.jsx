import React from "react";
import FormValidator from "../utils/FormValidator";
import { Link } from "react-router-dom";
import Form from "./Form";
import { useNavigate } from "react-router-dom";
import api from "../utils/Api";

function Register() {
  const navigate = useNavigate();

  const handleSubmit = (formData) => {
    api
      .register(formData)
      .then((data) => {
        console.log("Registration successful:", data);
        navigate("/login");
      })
      .catch((error) => {
        console.error("Registration error:", error);
      });
  };

  return (
    <div className="register__container">
      <Form type="register" onSubmit={handleSubmit} />
    </div>
  );
}

export default Register;
