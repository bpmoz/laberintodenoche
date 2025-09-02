import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MainComponent from "./components/Main";
import "./index.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import EpisodeDetail from "./components/Episodedetail";
import UserProfile from "./components/Userprofile";
import { CurrentUserProvider } from "./context/CurrentContextUser";
import { ThemeProvider } from "./context/ThemeProvider";

function PodcastApp() {
  return (
    <div className="podcast-app">
      {}
      <ThemeProvider>
        <CurrentUserProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<MainComponent />}></Route>
              <Route path="/episode/:slug" element={<EpisodeDetail />} />
              <Route path="/registrate" element={<Register />}></Route>
              <Route path="/login" element={<Login />}></Route>
              <Route path="/me" element={<UserProfile />}></Route>
            </Routes>
          </BrowserRouter>
          <Footer />
        </CurrentUserProvider>
      </ThemeProvider>
    </div>
  );
}

export default PodcastApp;
