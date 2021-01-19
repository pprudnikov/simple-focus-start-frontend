import React, { useContext, useEffect, useState } from 'react';
import { auth } from "../firebase";
import firebase from 'firebase';

const AuthContext = React.createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  // state
  const [ currentUser, setCurrentUser ] = useState();
  const [ allUsers, setAllUsers ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  // other

  const signup = (email, password, name) => auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      let userId = firebase.auth().currentUser.uid
      firebase.database().ref(`users/${userId}`).set({
        name: name,
        email: email,
        online: true
      })
    })
    .finally(() => {});

  const login = (email, password) => auth.signInWithEmailAndPassword(email, password);

  const loginHandler = (user) => {
    firebase.database().ref('users/' + user.uid).once('value', snapshot => {
      let userDetails = snapshot.val();
      setCurrentUser({
        name: userDetails.name,
        email: userDetails.email,
        id: user.uid
      })
    }).finally(() => {
      setLoading(false);
    });
    updateUser({
      id: user.uid,
      updates: {
        email: user.email,
        online: true
      }
    })
    // getUsers();
  }

  const logoutHandler = () => {
    updateUser({
      id: currentUser.id,
      updates: {
        email: currentUser.email,
        online: false
      }
    })
    setAllUsers([]);
    setCurrentUser();
  }

  const logout = () => auth.signOut()
    .finally(() => logoutHandler());

  const resetPassword = (email) => auth.sendPasswordResetEmail(email);

  const updateEmail = (email) => currentUser.updateEmail(email);

  const updatePassword = (password) => currentUser.updatePassword(password);

  const updateUser = (payload) => {
    if (payload.id) firebase.database().ref('users/' + payload.id).update(payload.updates);
  }

  const getUsers = () => {
    firebase.database().ref('users').on('child_added', snapshot => {
      const userDetails = snapshot.val();
      let id = snapshot.key;
      setAllUsers([ ...allUsers, { id, userDetails } ]);
    });
    firebase.database().ref('users').on('child_changed', snapshot => {
      const userDetails = snapshot.val();
      let id = snapshot.key;
      updateUser({ id, userDetails });
    });
  }
// eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        loginHandler(user);
      } else {
        logoutHandler();
      }
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log(currentUser);
  }, [currentUser])

  // const handleOnAuthStateChanged = () => {
  //   firebase.auth().onAuthStateChanged(user => {
  //     setLoading(true);
  //     if (user) {
  //       firebase.database().ref('users/' + user.uid).once('value', snapshot => {
  //         let userDetails = snapshot.val();
  //         setCurrentUser({
  //           name: userDetails.name,
  //           email: userDetails.email,
  //           id: user.uid
  //         })
  //       })
  //       updateUser({
  //         id: user.uid,
  //         updates: {
  //           email: user.email,
  //           online: true
  //         }
  //       })
  //       getUsers();
  //     } else {
  //       console.log(currentUser);
  //       updateUser({
  //         id: currentUser.id,
  //         updates: {
  //           email: currentUser.email,
  //           online: false
  //         }
  //       })
  //       setAllUsers([]);
  //       setCurrentUser();
  //     }
  //     setLoading(false);
  //   });
  // }
  //

  // const getUser = () => {
  //   return new Promise((resolve) => {
  //     if (currentUser) {
  //       resolve(currentUser);
  //       console.log(currentUser);
  //     }
  //   })
  // }

  const value = {
    currentUser,
    allUsers,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
