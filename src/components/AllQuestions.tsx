import ReactPaginate from "react-paginate";
import { FC, useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { FaRegSave, FaCheck } from "react-icons/fa";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Spinner from "./Spinner";
import { dbConstants } from "../utils/db.constant";

export interface isData {
  id: number;
  answer: string;
  question?: string;
}

interface questionsProps {
  notify: (msg: string, type: string) => void;
}

const AllQuestions: FC<questionsProps> = ({ notify }) => {
  const [questions, setQuestions] = useState<isData[]>();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [email, setEmail] = useState("");
  const [savedQ, setSavedQ] = useState<number[]>([]);
  const [loading, setLoading] = useState(0);
  const itemsPerPage = 50;
  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (user && user.email) {
        console.log(user);
        setEmail(user.email);
      } else {
        console.log("hello from auth on auth");
      }
    });
    async function getIds() {
      const docRef = doc(db, dbConstants.questionCollectionName, email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("ids", docSnap.data().ids);
        setSavedQ(docSnap.data().ids);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
    getIds();
  }, [email]);

  useEffect(() => {
    console.log("auth currentuser", auth.currentUser);
  }, []);

  useEffect(() => {
    fetch("pitanja.json")
      .then((res) => res.json())
      .then((data) => {
        setTotal(data.length);
        setQuestions(data.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage));
      });
  }, [page]);

  function handlePageClick(data: { selected: number }) {
    setPage(data.selected);
  }
  // wil save answer in ids array on backend side
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
      notify("Došlo je do greške", "error");
      console.log(error);
    }
  }
  // remove answer
  async function removeAnswer(id: isData["id"]) {
    setLoading(id);
    setTimeout(() => {
      setLoading(0);
    }, 300);
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
      notify("Pitanje je izbrisano iz beležnice", "success");
    } catch (error) {
      notify("Došlo je do greške", "error");
      console.log(error);
    }
  }
  return (
    <div className="items-container">
      {questions?.map((question) => {
        return (
          <div className="item-container" key={question.id}>
            <p>{question.id}.</p>
            <p className="item-question">{question.question?.toLowerCase()}</p>
            <p
              className="item-answer"
              onMouseOver={(evt) => {
                const e = evt.currentTarget;

                setTimeout(() => {
                  e.classList.add("active");
                }, 100);
              }}
            >
              <strong onClick={() => window.open(`https://www.google.com/search?q=${question.answer}`)}>{question.answer}</strong>
            </p>
            {email && (
              <IconContext.Provider value={{ className: "save-icons" }}>
                {question.id === loading ? (
                  <Spinner />
                ) : savedQ.includes(question.id) ? (
                  <FaCheck
                    onClick={() => {
                      removeAnswer(question.id);
                      setSavedQ(savedQ.filter((id) => id !== question.id));
                    }}
                  />
                ) : (
                  <FaRegSave
                    onClick={() => {
                      saveAnswer(question.id);
                      setSavedQ([...savedQ, question.id]);
                    }}
                  />
                )}
              </IconContext.Provider>
            )}
          </div>
        );
      })}
      <ReactPaginate
        previousLabel={"previous"}
        nextLabel={"next"}
        breakLabel={"..."}
        breakClassName={"break-me"}
        pageCount={Math.ceil(total / itemsPerPage)}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        containerClassName={"pagination"}
        activeClassName={"active"}
        forcePage={page}
        onPageChange={handlePageClick}
      />
    </div>
  );
};

export default AllQuestions;
