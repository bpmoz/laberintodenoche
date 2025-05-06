import React, { useState } from "react";
import InputComponent from "./Input";
import { AtSign, Lock, User, Eye, EyeOff } from "lucide-react";
import { validateField, validateForm } from "../utils/FormValidator";

const Form = ({ type = "login", onSubmit, additionalFields = [] }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    ...(type === "register" ? { username: "" } : {}),
    ...Object.fromEntries(additionalFields.map((field) => [field.name, ""])),
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validateField(name, value, type);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    if (!touched[name]) {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value, type);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { errors: newErrors, isValid } = validateForm(formData, type);

    const newTouched = {};
    Object.keys(formData).forEach((name) => {
      newTouched[name] = true;
    });

    setTouched(newTouched);
    setErrors(newErrors);

    if (isValid && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="form__container">
      <h2 className="form__title">
        {type === "login" ? "Ingresar" : "Registrate"}
      </h2>
      <form onSubmit={handleSubmit} className="auth__form">
        {type === "register" && (
          <div className="form__group">
            <User className="form__icon" size={20} />
            <InputComponent
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`custom__input ${
                errors.username ? "input_type_error" : ""
              }`}
              required
            />
            {touched.username && errors.username && (
              <span className="error-message error_visible">
                {errors.username}
              </span>
            )}
          </div>
        )}

        {additionalFields.map((field) => (
          <div key={field.name} className="form__group">
            <InputComponent
              type={field.type || "text"}
              name={field.name}
              placeholder={field.placeholder}
              value={formData[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`custom__input ${
                errors[field.name] ? "input_type_error" : ""
              }`}
              required={field.required}
            />
            {touched[field.name] && errors[field.name] && (
              <span className="error-message error_visible">
                {errors[field.name]}
              </span>
            )}
          </div>
        ))}

        <div className="form__group">
          <AtSign className="form__icon" size={20} />
          <InputComponent
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`custom__input ${
              errors.email ? "input_type_error" : ""
            }`}
            required
          />
          {touched.email && errors.email && (
            <span className="error-message error_visible">{errors.email}</span>
          )}
        </div>

        <div className="form__group">
          <Lock className="form__icon" size={20} />
          <InputComponent
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`custom__input ${
              errors.password ? "input_type_error" : ""
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="form__password-toggle"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {touched.password && errors.password && (
            <span className="error-message error_visible">
              {errors.password}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`form__submit-btn ${
            Object.values(errors).some((error) => error)
              ? "form__submit-btn_disabled"
              : ""
          }`}
          disabled={Object.values(errors).some((error) => error)}
        >
          {type === "login" ? "Ir al laberinto" : "Registrate"}
        </button>
      </form>

      <div className="form__footer">
        {type === "login" ? (
          <p>
            No estoy registrado{" "}
            <a href="/registrate" className="auth-link">
              Registrate
            </a>
          </p>
        ) : (
          <p>
            Ya estás en el laberinto?{" "}
            <a href="/login" className="form__link">
              Entrar
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default Form;
