import React, { useState, useContext, useEffect, useRef } from "react";
import PopupWithForm from "./PopupWithForm";
import { CurrentUserContext } from "../context/CurrentContextUser";

function EditProfilePopup({
  isOpen,
  onClose,
  onUpdateUserProfile,
  onUpdateProfilePicture,
  onUpdateUserInfo,
}) {
  const { currentUser } = useContext(CurrentUserContext);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username || "");
      setBio(currentUser.bio || "");
      setProfilePicture(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [currentUser, isOpen]);

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
    } else {
      setProfilePicture(null);
    }
  };

  function handleChangeUsername(e) {
    setUsername(e.target.value);
  }

  function handleChangeBio(e) {
    setBio(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!currentUser) {
      console.error("Current user data is not available.");
      onClose();
      return;
    }

    const usernameChanged = username !== currentUser.username;
    const bioChanged = bio !== currentUser.bio;

    if (profilePicture) {
      const formData = new FormData();
      formData.append("profilePicture", profilePicture);

      if (usernameChanged || bioChanged) {
        formData.append("username", username);
        formData.append("bio", bio);
        onUpdateUserProfile(formData);
      } else {
        onUpdateProfilePicture(formData);
      }
    } else if (usernameChanged || bioChanged) {
      onUpdateUserInfo({ username, bio });
    } else {
      onClose();
    }

    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <PopupWithForm
      isOpen={isOpen}
      onSubmit={handleSubmit}
      onClose={onClose}
      title="Editar perfil"
      name="Perfil"
      btnText="Guardar"
    >
      <input
        type="text"
        name="username"
        value={username}
        placeholder="Nombre de usuario"
        onChange={handleChangeUsername}
        className="popup__input"
        id="input-username"
        required
        minLength="2"
        maxLength="40"
      />
      <span className="popup__error-visible input-username-error"></span>
      <input
        type="text"
        name="bio"
        value={bio}
        placeholder="Biografía"
        onChange={handleChangeBio}
        className="popup__input"
        id="input-bio"
        required
        minLength="2"
        maxLength="200"
      />
      {}
      <input
        type="file"
        accept="image/*"
        onChange={handleProfilePictureChange}
        id="profile-picture-input"
        ref={fileInputRef}
        style={{ marginTop: "10px" }}
      />
      <span className="popup__error-visible input-bio-error"></span>
    </PopupWithForm>
  );
}

export default EditProfilePopup;
