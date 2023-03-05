import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { auth } from "../firebase";

function Navigation() {
  const [user, setUser] = useState("");
  const [photo, setPhoto] = useState("");
  let activeStyle = {
    textDecoration: "underline",
  };
  let activeClassName = "active";

  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (user && user.displayName) {
        setUser(user.displayName);
      }
      if (user && user.photoURL) {
        setPhoto(user.photoURL);
      } else {
        console.log("hello from auth on auth");
      }
    });
  }, []);

  return (
    <nav>
      <ul>
        <li>
          <NavLink to="practice" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
            Questions
          </NavLink>
        </li>
        <li>
          <NavLink to="quiz" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
            Quiz
          </NavLink>
        </li>
        {!user && (
          <li>
            <NavLink to="signup" className={({ isActive }) => (isActive ? activeClassName : undefined)}>
              Register
            </NavLink>
          </li>
        )}
        {!user && (
          <li>
            <NavLink to="login">
              {({ isActive }) => <span className={isActive ? activeClassName : undefined}>Login</span>}
            </NavLink>
          </li>
        )}
        {user && (
          <li>
            <NavLink to="/notes" className={({ isActive }) => (isActive ? activeClassName : undefined)}>
              Notes
            </NavLink>
          </li>
        )}
        {user && (
          <li>
            <NavLink
              to="/"
              onClick={() => {
                setUser("");
                setPhoto("");
                auth.signOut();
              }}
            >
              Logout
            </NavLink>
          </li>
        )}
        {photo ? (
          <img src={photo} className="nav-photo" alt="" referrerPolicy="no-referrer" />
        ) : (
          <p className="user-name">{user}</p>
        )}
      </ul>
    </nav>
  );
}

export default Navigation;
