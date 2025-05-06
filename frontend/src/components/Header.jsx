import React, { useContext, useEffect } from "react";
import laberintoLogo from "../images/laberinto_noche.svg";
import { useLocation, Link } from "react-router-dom";
import { CurrentUserContext } from "../context/CurrentContextUser";

function Header() {
  const location = useLocation();
  const isRegisterPage = location.pathname === "/registrate";
  const { currentUser, isLoggedIn, logout } = useContext(CurrentUserContext);

  useEffect(() => {
    console.log("isLoggedIn:", isLoggedIn);
    console.log("currentUser:", currentUser);
  }, [isLoggedIn, currentUser]);
  return (
    <header className="header">
      <div>
        <Link to="/" className="header__link">
          <img
            src={laberintoLogo}
            alt="Logo Laberinto de noche"
            className="header__logo"
          />
        </Link>
        <p className="header__subtitle">conversaciones sobre libros...</p>
      </div>
      <div className="header__buttons">
        {isLoggedIn ? (
          <>
            <Link to="/me" className="header__user">
              <p>Hola, {currentUser?.email || "User"}!</p>
            </Link>
            <p onClick={logout} className="header__primary-button">
              Cerrar sesión
            </p>
          </>
        ) : (
          <>
            {!isRegisterPage && (
              <Link to="/registrate" className="header__primary-button">
                Unite al laberinto
              </Link>
            )}
            <a href="#about" className="header__secondary-button">
              Sobre nosotros
            </a>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
