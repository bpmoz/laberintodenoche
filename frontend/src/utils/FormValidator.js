export const validateField = (name, value, formType) => {
  let error = "";

  switch (name) {
    case "username":
      if (value.length < 3) {
        error = "El nombre de usuario debe tener al menos 3 caracteres.";
      }
      break;
    case "email":
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        error = "Ingrese una dirección de correo electrónico válida.";
      }
      break;
    case "password":
      if (formType === "register" && value.length < 4) {
        error = "La contraseña debe tener al menos 4 caracteres.";
      } else if (value.length === 0) {
        error = "La contraseña es obligatoria.";
      }
      break;
    default:
      if (value.length === 0) {
        error = "Este campo es obligatorio.";
      }
  }

  return error;
};

export const validateForm = (formData, formType) => {
  const errors = {};
  let isValid = true;

  Object.entries(formData).forEach(([fieldName, fieldValue]) => {
    const error = validateField(fieldName, fieldValue, formType);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { errors, isValid };
};

const FormValidator = {
  validateField,
  validateForm,
};

export default FormValidator;
