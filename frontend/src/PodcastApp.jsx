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
      {/*
        Wrap your entire application with both providers.
        The order doesn't strictly matter for these two, but
        it's a good practice to place them at the top level
        so all components have access to their contexts.
      */}
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
