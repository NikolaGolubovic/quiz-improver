import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { FC, useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { FaCheck, FaRegSave } from "react-icons/fa";
import { auth, db } from "../firebase";
import { dbConstants, numOfQuestions } from "../utils/db.constant";
import Spinner from "./Spinner";

export interface isData {
  id: number;
  answer: string;
  question: string;
}

interface quizProps {
  notify: (msg: string, type: string) => void;
}

const Quiz: FC<quizProps> = ({ notify }) => {
  const [questions, setQuestions] = useState<isData[]>([]);
  const [answers, setAnswers] = useState<{ id: number; answer?: string }[]>([]);
  const [compareAnswers, setCompareAnswers] = useState<
    { id: number; answer: string; solution: string; question: string; check: boolean }[]
  >([]);
  const [showCompare, setShowCompare] = useState(false);
  const [points, setPoints] = useState(0);
  const [email, setEmail] = useState("");
  const [savedQ, setSavedQ] = useState<number[]>([]);
  const [loading, setLoading] = useState(0);

  const help = true;

  useEffect(() => {
    const questionsIds = randomRange(numOfQuestions, 10);
    fetch("pitanja.json")
      .then((res) => res.json())
      .then((data: isData[]) => {
        const selectedItems = data.filter((item) => questionsIds.includes(item.id));

        setQuestions(selectedItems);
        setAnswers(
          selectedItems.map((item) => {
            return { id: item.id };
          })
        );
      });
    async function getIds() {
      const docRef = doc(db, dbConstants.questionCollectionName, email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSavedQ(docSnap.data().ids);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
    getIds();
  }, [email]);
  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (user && user.email) {
        setEmail(user.email);
      } else {
        console.log("hello from auth on auth");
      }
    });
  }, []);
  function randomRange(max: number, numOfQuestions: number) {
    const arr: number[] = [];
    while (arr.length < numOfQuestions) {
      if (max < numOfQuestions) {
        console.log("not allowed form of array, max sould be bigger than numOfQuestions");
        break;
      }
      let randomNum = Math.floor(Math.random() * max + 1);
      while (arr.includes(randomNum)) {
        randomNum = Math.floor(Math.random() * max + 1);
      }
      arr.push(randomNum);
    }
    return arr;
  }

  function modifyAnswer(answer: string, placeholder: boolean = false): string {
    let ghostLetters;
    if (placeholder) {
      ghostLetters = answer
        .split(" ")
        .map((word) =>
          word
            .split("")
            .map((letter, index) => ((help && index === 0) || (help && index === word.length - 1) ? letter : "_"))
            .join("")
        )
        .join(" ");
    } else {
      ghostLetters = answer;
    }
    if (answer.indexOf("/") !== -1) {
      ghostLetters = ghostLetters.slice(0, answer.indexOf("/")).trim();
    }
    if (answer.indexOf("(") === 0) {
      ghostLetters = ghostLetters.slice(ghostLetters.indexOf(")") + 1).trim();
    }
    if (answer.indexOf("(") !== -1 && ghostLetters.indexOf("(") !== 0) {
      ghostLetters = ghostLetters.slice(0, ghostLetters.indexOf("(")).trim();
    }
    if (answer[0] === '"') {
      ghostLetters = ghostLetters.slice(1);
    }
    if (answer[answer.length - 1] === '"') {
      ghostLetters = ghostLetters.slice(0, -1);
    }
    return ghostLetters;
  }

  function collectAnswers(e: React.ChangeEvent<HTMLInputElement>, id: number) {
    setAnswers(answers.map((answer) => (answer.id === id ? { id, answer: e.target.value } : answer)));
  }

  // otkini zagradu iz answera
  function confirmAnswers() {
    const compareArr: { id: number; solution: string; answer: string; check: boolean; question: string }[] = [];
    let points = 0;
    answers.forEach((solution, index) => {
      console.log(modifyAnswer(questions[index].answer.toLowerCase()));
      if (
        solution.answer &&
        solution.answer.length > 0 &&
        solution.answer.toLocaleLowerCase() === modifyAnswer(questions[index].answer.toLowerCase())
      ) {
        compareArr.push({
          id: solution.id,
          solution: solution.answer.trim(),
          answer: questions[index].answer.toLocaleLowerCase(),
          check: true,
          question: questions[index].question,
        });
      } else {
        compareArr.push({
          id: solution.id,
          solution: "",
          answer: questions[index].answer.toLocaleLowerCase(),
          check: false,
          question: questions[index].question,
        });
      }
    });
    compareArr.forEach((elem) => {
      if (elem.solution === elem.answer) {
        points += 1;
      }
    });
    setCompareAnswers([...compareArr]);
    setShowCompare(true);
    setPoints(points);
  }
  async function saveAnswer(id: isData["id"]) {
    // const q = query(collection(db, "questionsByUser"), where("email", "==", email));
    setLoading(id);
    setTimeout(() => {
      setLoading(0);
    }, 300);
    const docRef = doc(db, dbConstants.questionCollectionName, email);
    const docSnap = (await getDoc(docRef)) || [];
    let ids = [id];
    if (docSnap.exists()) {
      ids = ids.concat(...docSnap.data().ids);
    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
    try {
      await setDoc(
        doc(db, dbConstants.questionCollectionName, email),
        {
          email: auth.currentUser?.email,
          ids: ids,
        },
        { merge: true }
      );
      notify("Pitanje je uspešno sačuvano", "success");
    } catch (error) {
      notify("Došlo je do greške sa sejvovanjem pitanja", "error");
      console.log(error);
    }
  }
  // remove answer
  async function removeAnswer(id: isData["id"]) {
    const docRef = doc(db, dbConstants.questionCollectionName, email);
    const docSnap = (await getDoc(docRef)) || [];
    let ids: number[] = [];
    if (docSnap.exists()) {
      ids = docSnap.data().ids.filter((savedId: number) => savedId !== id);
    } else {
      console.log("No such document!");
    }
    try {
      await setDoc(
        doc(db, dbConstants.questionCollectionName, email),
        {
          email: auth.currentUser?.email,
          ids: ids,
        },
        { merge: true }
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="quiz-container">
      {questions?.map((question, index) => {
        return (
          <div key={question.id} className="quiz-question-container">
            <p>{index + 1}.</p>
            <p className="quiz-question">{question.question?.toLowerCase()}</p>

            <input
              className="placeholder-dashes"
              type="text"
              placeholder={modifyAnswer(question.answer, true)}
              onChange={(e) => collectAnswers(e, question.id)}
            />
          </div>
        );
      })}
      <button className="btn-quiz" onClick={() => confirmAnswers()}>
        Potvrdi
      </button>
      <div className="quiz-compare">
        {showCompare && <small>points: {points}</small>}
        {showCompare &&
          compareAnswers.map((compare, index) => {
            return (
              <div
                key={compare.id}
                className="compare-item"
                style={{
                  border: compare.check ? "1px solid rgba(50, 222, 132, 0.8)" : "1px solid rgba(247, 28, 48, 0.8)",
                }}
              >
                <p className="compare-index">{index + 1}.</p>
                <p className="compare-question">{compare.question.toLowerCase()}</p>
                <p className="compare-answer">{compare.answer.toLowerCase()}</p>
                {email && (
                  <IconContext.Provider value={{ className: "compare-save-icons" }}>
                    {compare.id === loading ? (
                      <Spinner />
                    ) : savedQ.includes(compare.id) ? (
                      <FaCheck
                        onClick={() => {
                          removeAnswer(compare.id);
                          setSavedQ(savedQ.filter((id) => id !== compare.id));
                        }}
                        className="compare-save"
                      />
                    ) : (
                      <FaRegSave
                        onClick={() => {
                          saveAnswer(compare.id);
                          setSavedQ([...savedQ, compare.id]);
                        }}
                        className="compare-save"
                      />
                    )}
                  </IconContext.Provider>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Quiz;
