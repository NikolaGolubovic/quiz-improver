import React, { useState, SyntheticEvent, FC } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { NavLink, useNavigate } from "react-router-dom";

interface loginProps {
  notify: (msg: string, type: string) => void;
}

const Login: FC<loginProps> = ({ notify }) => {
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = (e: SyntheticEvent) => {
    console.log(email, password);
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        navigate("/");
        notify("Uspešno si prijavljen", "success");
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  function googleLogin() {
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        navigate("/");
        notify("Uspešno si prijavljen", "success");
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        notify("Something went wrong " + error.message, "errog");
        // Handle Errors here.
        // const errorCode = error.code;
        // const errorMessage = error.message;
        // // The email of the user's account used.
        // const email = error.customData.email;
        // // The AuthCredential type that was used.
        // const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  return (
    <>
      <main>
        <section className="section-form">
          <button type="button" className="login-with-google-btn" onClick={() => googleLogin()}>
            Sign in with Google
          </button>
          <form className="login-form">
            <div>
              <label htmlFor="email-address">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="Email address"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>

            <div>
              <button
                className="btn-sign"
                onClick={(e) => {
                  onLogin(e);
                }}
              >
                Login
              </button>
            </div>
          </form>

          <p className="already-account">
            No account yet? <NavLink to="/signup">Sign up</NavLink>
          </p>
        </section>
      </main>
    </>
  );
};

export default Login;
