import React from "react";
//import closeBtn from "../images/Closeicon.png";
import PropTypes from "prop-types";
import FormValidator from "../utils/FormValidator";

export default function PopupWithForm(props) {
  PopupWithForm.propTypes = {
    name: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    btnText: PropTypes.string.isRequired,
  };
  /*   const formRef = React.useRef();
  React.useEffect(() => {
    const validator = new FormValidator(formRef.current, {
      inputSelector: ".popup__input",
      formSelector: ".popup__form",
      submitButtonSelector: ".popup__btn",
      inactiveButtonClass: "popup__btn_disabled",
      inputErrorClass: "popup__input_error",
      inputErrorMessageClass: "popup__input-error_message",
    });
    validator.enableValidation();
  }); */

  return (
    <div
      className={`popup popup_type_${props.name} ${
        props.isOpen ? "popup__open" : ""
      }`}
    >
      <div className="popup__container">
        <div className="popup__overlay" onClick={props.onClose}></div>
        <form
          // ref={formRef}
          id="profile-form"
          className={`popup__form popup__${props.name}`}
          onSubmit={props.onSubmit}
          name={props.name}
          noValidate
        >
          {/*   <img
            onClick={props.onClose}
            src={closeBtn}
            alt="Close icon"
            className="popup__close-icon"
            id="popup-close"
          /> */}
          <h2 className="popup__header">{props.title}</h2>

          {props.children}

          <button type="submit" className="popup__btn">
            {props.btnText}
          </button>
        </form>
      </div>
    </div>
  );
}
