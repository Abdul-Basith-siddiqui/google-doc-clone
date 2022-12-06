import React from "react";
import TextEditor from "./textEditor";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { v4 as uuidV4 } from "uuid";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          exact
          element={<Navigate replace to={`/documents/${uuidV4()}`} />}
        ></Route>

        <Route path="/documents/:id" element={<TextEditor />}></Route>
      </Routes>
    </Router>
  );
}
