import React from "react";

const InputComponent = ({
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  className = "",
}) => {
  return (
    <div className="input__container">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        className={`custom__input ${className}`}
      />
    </div>
  );
};

export default InputComponent;
