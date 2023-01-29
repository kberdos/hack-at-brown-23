// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  onValue,
} from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.16.0/firebase-database.min.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6E3V4aj3P1nNI7k9ZyAUw8D1Cgbvbi0s",
  authDomain: "husky-c6b70.firebaseapp.com",
  databaseURL: "https://husky-c6b70-default-rtdb.firebaseio.com",
  projectId: "husky-c6b70",
  storageBucket: "husky-c6b70.appspot.com",
  messagingSenderId: "1098366956197",
  appId: "1:1098366956197:web:83bd54ff3453ce0bd2d34c",
  measurementId: "G-PECB9FE5T3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth
const auth = getAuth();

var userdb;
var uid;

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in, see docs for a list of available properties
    // https://firebase.google.com/docs/reference/js/firebase.User
    uid = user.uid;
    get(child(dbRef, `/users/${uid}/`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          userdb = snapshot.val();
          $("#userInfo").html("Lets get jammin' " + userdb.fname + "!");
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });

    // ...
  } else {
    // User is signed out
    // ...
    $("#userInfo").html(
      `Please <a href =  \"../profile/make-profile.html\">sign in</a> to get jammin'!`
    );
  }
});

// Read DB
const db = getDatabase();
const dbRef = ref(db);

$("#jamForm").submit((e) => {
  e.preventDefault();
});
$("#form_send").on("click", () => {
  console.log(userdb.jam);
  if (userdb.jam != 0) {
    $("#userInfo").html(
      "You already have an active jam, " + userdb.fname + "!"
    );
  } else {
    // turn the form into an array
    const userData = $("#jamForm").serializeArray();
    console.log(userData);
    const location = userData[0].value;
    const genre = userData[1].value;
    const blurb = userData[2].value;
    const users = [uid];
    const jamId = Math.floor(100000000 + Math.random() * 900000000);
    writeJamData(jamId, location, genre, blurb, users);
    // add the jam key to the user
    writeUserData(
      uid,
      userdb.fname,
      userdb.lname,
      userdb.email,
      userdb.graduation_year,
      userdb.instruments,
      userdb.genres,
      userdb.experience,
      jamId
    );
  }
});

function writeJamData(id, loc, gen, b, usrs) {
  set(ref(db, "jams/" + id), {
    location: loc,
    genre: gen,
    blurb: b,
    users: usrs,
    active: true,
  });
  // add the jam key to the user
  window.alert("Jam Created. Rock on!");
  location.reload();
}

function writeUserData(id, f, l, email, y, inst, genr, exp, key) {
  console.log("cock");
  set(ref(db, "users/" + id), {
    fname: f,
    lname: l,
    email: email,
    graduation_year: y,
    instruments: inst,
    genres: genr,
    experience: exp,
    jam: key,
  });
}

async function getUserData(id) {
  get(child(dbRef, `/users/${id}/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const user = snapshot.val();
        console.log(JSON.parse(JSON.stringify(user)));

        return JSON.parse(JSON.stringify(user));
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
