import { collection, onSnapshot } from "firebase/firestore";
import { createContext, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { auth, db } from "../config/FirebaseConfig";
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'




const RandomContext = createContext();

const RandomProvider = ({ children }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [randomFriends, setRandomFriends] = useState([]);
  const [show, setShow] = useState(null);

  const [friends, setFriends] = useState([]);
  useEffect(() => {
    onSnapshot(collection(db, "users"), (snapshot) => {
      return setAllUsers(snapshot.docs);
    });
  }, []);

  useEffect(() => {
    onSnapshot(
      collection(db, "users", `${auth.currentUser?.uid}`, "friends"),
      (snapshot) => {
        return setFriends(snapshot.docs);
      }
    );
  }, [allUsers]);

  const withoutMe = allUsers.filter((x) => {
    return x.data().userId.indexOf(auth.currentUser?.uid) === -1;
  });

  const friendNames = friends.map((x) => {
    return x.data().username;
  });

  const FilterRandom = withoutMe.filter((x) => {
    return !friendNames.includes(x.data().username);
  });

  const pureDataUsers = FilterRandom.map((x) => {
    return x.data();
  });

  const navigation = useNavigate();

  // swa2

  const MySwal = withReactContent(Swal)

  const searchRandom = () => {
    setRandomFriends(
      pureDataUsers[Math.floor(Math.random() * pureDataUsers.length)]
    );
    if (FilterRandom.length <= 0) {
     setShow(false);
     MySwal.fire({
      icon: "error",
      title: "Oops...",
      text: "You've Added Anyone You Can Add Friend Try Next Time!",
      heightAuto: "100%"
    });
    } else {
      navigation("/Random");
      setShow(true)
    }

  
  };

  const values = useMemo(
    () => ({ withoutMe, searchRandom, randomFriends , show , friends }),
    [searchRandom, friends]
  );

  return (
    <RandomContext.Provider value={values}>{children}</RandomContext.Provider>
  );
};

export { RandomProvider, RandomContext };
