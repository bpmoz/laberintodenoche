import React from "react";
import igLogo from "../images/iglogo.svg";
import xlogo from "../images/xlogo.png";
import maillogo from "../images/mail.svg";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__content">
          <div className="footer__branding">
            <h3 className="footer__text">Laberinto de noche</h3>
            <p className="footer__copy">© 2025 </p>
          </div>

          <div className="footer__links">
            <div className="footer__social-links">
              <a href="https://twitter.com/laberintonoche" target="_blank">
                <img src={xlogo} alt="X logo" className="footer__logo-x"></img>
              </a>
              <a
                href="https://www.instagram.com/laberintodenoche/"
                target="_blank"
              >
                <img
                  src={igLogo}
                  alt="Instagram Logo"
                  className="footer__logo"
                ></img>
              </a>
              <a href="#">
                <img src={maillogo} className="footer__logo"></img>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
