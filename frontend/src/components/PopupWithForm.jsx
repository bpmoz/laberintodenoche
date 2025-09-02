import React from "react";
import PropTypes from "prop-types";
import closeIcon from "../images/close-icon.png";

export default function PopupWithForm(props) {
  PopupWithForm.propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    btnText: PropTypes.string.isRequired,
  };

  return (
    <div
      className={`popup popup_type_${props.name} ${
        props.isOpen ? "popup__open" : ""
      }`}
    >
      <div className="popup__container">
        <button
          className="popup__close-icon"
          type="button"
          onClick={props.onClose}
        >
          <img
            src={closeIcon}
            alt="Close"
            className="popup__close-icon-image"
          />
        </button>
        <form
          className={`popup__form popup__${props.name}`}
          onSubmit={props.onSubmit}
          name={props.name}
          noValidate
        >
          <h2 className="popup__header">{props.title}</h2>
          {props.children}
          <button type="submit" className="popup__btn">
            {props.btnText}
          </button>
        </form>
      </div>
      <div className="popup__overlay" onClick={props.onClose}></div>
    </div>
  );
}
