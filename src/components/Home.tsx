import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const Home = () => {
  const navigate = useNavigate();

  console.log(auth.currentUser?.email);

  const specialOfTheDay = doc(db, "dailySpecial/2023-04-23");

  function writeDailySpecial() {
    const docData = {
      description: "A delicious vanilla latte",
      price: 3.99,
      user: auth.currentUser?.email,
    };
    updateDoc(specialOfTheDay, docData);
  }

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        navigate("/practice");
        console.log("Signed out successfully");
      })
      .catch((error) => {
        console.log("nikola napisao error", error);
      });
  };

  return (
    <>
      <div className="homepage">
        <a href="/practice">
          <img src={process.env.PUBLIC_URL + "/img/slagalica.png"} alt="" />
          <p>Klikni da vežbaš</p>
        </a>
      </div>
    </>
  );
};

export default Home;
