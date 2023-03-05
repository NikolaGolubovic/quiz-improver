import { doc, getDoc, setDoc } from "firebase/firestore";
import { FC, useEffect, useState } from "react";
import { IconContext } from "react-icons";
import { FaWindowClose } from "react-icons/fa";
import { auth, db } from "../firebase";
import { dbConstants } from "../utils/db.constant";

interface isData {
  id: number;
  question?: string;
}

interface isFullData {
  id: number;
  answer: string;
  question: string;
}

interface notesProps {
  notify: (msg: string, type: string) => void;
}

const Notes: FC<notesProps> = ({ notify }) => {
  const [notes, setNotes] = useState<isFullData[]>([]);
  const [ids, setIds] = useState<isData[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(0);
  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (user && user.email) {
        console.log(user.email);
        setEmail(user.email);
      } else {
        console.log("hello from auth on auth");
      }
    });
    async function getIds() {
      const docRef = doc(db, "questionsByUser", email);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("ids", docSnap.data().ids);
        setIds(docSnap.data().ids);
      } else {
        // doc.data() will be undefined in this case
        console.log("No such document!");
      }
    }
    getIds();
  }, [email]);

  useEffect(() => {
    fetch("pitanja.json")
      .then((res) => res.json())
      .then((data: isFullData[]) => {
        // setTotal(data.length);
        // setQuestions(data.slice(page * itemsPerPage, page * itemsPerPage + itemsPerPage));
        data.forEach((elem) => {
          // @ts-ignore
          if (ids.includes(elem.id)) {
            setNotes((prevNotes) => [...prevNotes, elem]);
          }
        });
      });
  }, [ids]);

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
      setNotes(notes.filter((note) => note.id !== id));
      notify("Pitanje je izbrisano iz beležnice", "success");
    } catch (error) {
      notify("Došlo je do greške", "error");
      console.log(error);
    }
  }

  return (
    <div>
      {notes &&
        notes?.map((question, index) => {
          return (
            <div className="item-container" key={question.id}>
              <p>{index + 1}.</p>
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
                <strong onClick={() => window.open(`https://www.google.com/search?q=${question.answer}`)}>
                  {question.answer}
                </strong>
              </p>
              {email && (
                <IconContext.Provider value={{ className: "save-icons" }}>
                  {
                    <FaWindowClose
                      onClick={() => {
                        removeAnswer(question.id);
                      }}
                    />
                  }
                </IconContext.Provider>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default Notes;
