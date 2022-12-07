import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./containers/Home";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  </BrowserRouter>
);

export default App;
