// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js";
import { getDatabase, ref, set, child, get } from "../../node_modules/firebase/firebase-database.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyA6E3V4aj3P1nNI7k9ZyAUw8D1Cgbvbi0s",
  authDomain: "husky-c6b70.firebaseapp.com",
  databaseURL: "https://husky-c6b70-default-rtdb.firebaseio.com",
  projectId: "husky-c6b70",
  storageBucket: "husky-c6b70.appspot.com",
  messagingSenderId: "1098366956197",
  appId: "1:1098366956197:web:83bd54ff3453ce0bd2d34c",
  measurementId: "G-PECB9FE5T3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    const uid = user.uid;
    $("#userInfo").html("Signed in as "+user.email);
  } else {
    // User is signed out
    // ...
    $("#userInfo").html("Please sign in or create an account");
  }
});

$("#btnLogin").click(() => {
  const email = document.getElementById("txtEmail").value;
  const password = document.getElementById("txtPassword").value;
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    $("#userInfo").html("Signed in as "+email);
    const user = userCredential.user;
    $("#txtEmail").val('');
    $("#txtPassword").val('');
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    $("#userInfo").html(errorMessage);
  });
});

$("#btnLogout").click(() => {
  signOut(auth).then(() => {
    // Sign-out successful.
    $("#userInfo").html("Successfully signed out!");
  }).catch((error) => {
    // An error happened.
    $("#userInfo").html(error.message);
  });
})



// Read DB
const db = getDatabase();
const dbRef = ref(db);

get(child(dbRef, `/jams/`)).then((snapshot) => {
  if (snapshot.exists()) {
    console.log(snapshot.val());

    const jams = snapshot
  } else {
    console.log("No data available");
  }
}).catch((error) => {
  console.error(error);
});

$("#userForm").submit((e) => {
  e.preventDefault();
});
$("#form_send").on("click", () =>{
  // turn the form into an array
  const userData = $("#userForm").serializeArray();
  // console.log(userData);
  const fname = userData[0].value;
  const lname = userData[1].value;
  const email = userData[2].value;
  const password = userData[3].value;
  const year = userData[4].value;
  // parse the instruments into an array
  const instruments = userData[5].value.replace(/\s/g, '').split(",");
  // parse the genres into an array
  const genres = userData[6].value.replace(/\s/g, '').split(",");
  const experience = userData[7].value;
  // create the account
  createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    $("#userInfo").html("Created account as "+email);
    const user = userCredential.user;
    const uid = user.uid;
    writeUserData(
      uid,
      fname,
      lname,
      email,
      year,
      instruments,
      genres,
      experience);
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    $("#userInfo").html(errorMessage);
  });
})

function writeUserData(id, f, l, email, y, inst, genr, exp) {
  set(ref(db, 'users/' + id), {
    fname: f,
    lname: l,
    email: email,
    graduation_year: y,
    instruments: inst,
    genres: genr,
    experience: exp,
    jam: 0
  });
}