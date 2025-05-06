import React from "react";
import PodcastApp from "./PodcastApp";
import { CurrentUserProvider } from "./context/CurrentContextUser";

function App() {
  return (
    <CurrentUserProvider>
      <PodcastApp />
    </CurrentUserProvider>
  );
}

export default App;
