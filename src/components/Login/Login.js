import { useContext, useState } from "react";
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from "./firebase.config";
import { UserContext } from "../../App";

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

function Login() {
  const [newUser, setNewUser] = useState(false);
  const [user, setUser] = useState({
    isSignIn: false,
    name: "",
    email: "",
    password: "",
    photo: "",
    error: "",
    success: false,
  });

  const [loggedInUser, setLoggedInUser] = useContext(UserContext);

  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(googleProvider)
      .then((res) => {
        const { photoURL, displayName, email } = res.user;
        const singedInUser = {
          isSignIn: true,
          name: displayName,
          email: email,
          photo: photoURL,
        };
        setUser(singedInUser);
        console.log(photoURL, displayName, email);
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
        console.log(errorCode, errorMessage, email, credential);
      });
  };

  const handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        const signOutUser = {
          isSignIn: false,
          name: "",
          photo: "",
          email: "",
        };
        setUser(signOutUser);
      })
      .catch((error) => console.log(error));
  };

  const handleBlur = (e) => {
    let isFieldValid = true;
    if (e.target.name === "email") {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
      console.log(isFieldValid);
    }
    if (e.target.name === "password") {
      const isFieldValid =
        e.target.value.length > 6 && /\d{1}/.test(e.target.value);
      console.log(isFieldValid);
    }
    if (isFieldValid) {
      const newUserInfo = { ...user };
      newUserInfo[e.target.name] = e.target.value;
      setUser(newUserInfo);
    }
  };
  const handleSubmit = (e) => {
    if (newUser && user.email && user.password) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    if (!newUser && user.email && user.password) {
      firebase
        .auth()
        .signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = "";
          newUserInfo.success = true;
          setUser(newUserInfo);
          setLoggedInUser(newUserInfo);
          console.log("Sign in user info", res.user);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    e.preventDefault();
  };

  const updateUserName = (name) => {
    const user = firebase.auth().currentUser;

    user
      .updateProfile({
        displayName: name,
        photoURL: "https://example.com/jane-q-user/profile.jpg",
      })
      .then(function () {
        // Update successful.
        console.log("Update successful");
      })
      .catch(function (error) {
        // An error happened.
        console.log("An error happened", error);
      });
  };

  const handleFbSignIn = () => {
    firebase
      .auth()
      .signInWithPopup(fbProvider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */
        var credential = result.credential;

        // The signed-in user info.
        var user = result.user;

        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        var accessToken = credential.accessToken;

        console.log("Fb user after sign in", user);

        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;

        // ...
      });
  };

  const formStyle = {
    width: "400px",
    margin: "0 auto",
    marginTop: "50px",
    paddingBottom: "50px",
  };
  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <div className="center">
        {!user.isSignIn ? (
          <button onClick={handleSignIn}>Sign In With Google</button>
        ) : (
          <button onClick={handleSignOut}>Sign Out</button>
        )}
      </div>
      {user.isSignIn && (
        <div className="desc">
          <img src={user.photo} alt="" />
          <h1>Welcome {user.name}</h1>
          <h4>Your email: {user.email}</h4>
        </div>
      )}

      <br />

      <button onClick={handleFbSignIn}>Sign in using Facebook</button>

      <h1>Our Own Authentication</h1>

      <input
        type="checkbox"
        name="newUserRegistration"
        id="newUserRegistration"
        onChange={() => setNewUser(!newUser)}
      />
      <label htmlFor="newUserRegistration">New User Registration</label>
      <form style={formStyle} onSubmit={handleSubmit}>
        <fieldset>
          {newUser && (
            <input
              name="name"
              type="text"
              placeholder="Enter your name"
              onBlur={handleBlur}
            />
          )}
          <br />
          <input
            onBlur={handleBlur}
            // disabling the email type for using the regex
            // type="email"
            type="text"
            name="email"
            placeholder="Enter your email"
            required
          />
          <br />
          <input
            onBlur={handleBlur}
            required
            type="password"
            name="password"
            placeholder="Enter your password"
          />
        </fieldset>
        <button type="submit">{newUser ? "Sign up" : "Lgo In"}</button>
      </form>
      <p style={{ color: "red" }}>{user.error}</p>
      {user.success && (
        <p style={{ color: "green" }}>
          User {newUser ? "created" : "logged in"} successfully.
        </p>
      )}
    </div>
  );
}

export default Login;