import React, { useState, SyntheticEvent } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const onSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        updateProfile(userCredential.user, {
          displayName: displayName,
        });
        sendEmailVerification(userCredential.user);
        navigate("/login");
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        // ..
      });
  };

  return (
    <main>
      <section className="section-form">
        <form className="login-form">
          <h1>Register</h1>
          <div>
            <label htmlFor="email-address">Email address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email address" />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>

          <div>
            <label htmlFor="text">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Display Name"
            />
          </div>

          <button className="btn-sign" type="submit" onClick={onSubmit}>
            Sign up
          </button>
        </form>

        <p className="already-account">
          Already have an account? <NavLink to="/login">Sign in</NavLink>
        </p>
      </section>
    </main>
  );
};

export default Signup;
