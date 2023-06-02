import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AllQuestions from "./components/AllQuestions";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Home from "./components/Home";
import Navigation from "./components/Navigation";
import Notes from "./components/Notes";
import Quiz from "./components/Quiz";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  function notify(msg: string, type: string): void {
    if (type === "success") {
      console.log("hello from notify");
      let notifyFunc = () => toast["success"](msg, { position: toast.POSITION.TOP_CENTER });
      notifyFunc();
    }
    if (type === "error") {
      console.log("hello from notify");
      let notifyFunc = () => toast["error"](msg, { position: toast.POSITION.TOP_CENTER });
      notifyFunc();
    }
  }

  return (
    <Router>
      <ToastContainer autoClose={1500} />
      <Navigation />
      <Routes>
        {" "}
        <Route path="/practice" element={<AllQuestions notify={notify} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login notify={notify} />} />
        <Route path="/notes" element={<Notes notify={notify} />} />
        <Route path="/quiz" element={<Quiz notify={notify} />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
