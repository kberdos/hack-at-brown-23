// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js";
import {
  getDatabase,
  ref,
  set,
  child,
  get,
} from "../../node_modules/firebase/firebase-database.js";
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
        } else {
          console.log("No data available");
          $("#campfires").hide();
        }
      })
      .catch((error) => {
        console.error(error);
      });

    // ...
  } else {
    // User is signed out
    // ...
  }
});

// Read DB
const db = getDatabase();
const dbRef = ref(db);
var jams = [];

updateJams();
function updateJams() {
  get(child(dbRef, `/jams/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        jams = snapshot.val();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function updateUsers() {
  get(child(dbRef, `/users/${uid}/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        userdb = snapshot.val();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

var tempUserDb;

async function loadJams() {
  const campfire = document.getElementById("campfires");
  campfire.innerHTML = "";

  await updateJams();
  await updateUsers();

  for (let key in jams) {
    let jam = jams[key];

    var userList = [];

    if (jam.active && jam.users.length > 0) {
      const getUsernames = jam.users.map(async (id) => {
        await get(child(dbRef, `/users/${id}/`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              tempUserDb = snapshot.val();
              userList.push(tempUserDb.fname);
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      });

      await Promise.all(getUsernames);

      function makeButton() {
        console.log(`Comparing ${userdb.jam} to ${key}`);
        if (userdb.jam == key) return `<button id = "leaveBtn">Leave</button>`;
        if (userdb.jam == 0) return `<button id = "joinBtn"">Join</button>`;
        return ``;
      }

      document.getElementById("campfires").innerHTML += `<div id = jam_rect>
      <p class = "jam_text">Location: ${jam.location}</p>
      <p class = "jam_text">Jammers: ${userList.join(", ")}</p>
      <p class = "jam_text">Genre: ${jam.genre}</p>
      <p class = "jam_text">Blurb: ${jam.blurb}</p>
     ${makeButton()}
    </div>`;

      const leaveBtn = document.getElementById("leaveBtn");
      if (leaveBtn != null) {
        leaveBtn.addEventListener("click", () => {
          leaveJam();
        });
      }
      const joinBtn = document.getElementById("joinBtn");
      if (joinBtn != null) {
        joinBtn.addEventListener("click", () => {
          joinJam(key);
        });
      }
    }
  }
}

async function joinJam(key) {
  await leaveJam();
  // add the jam key to the user
  await writeUserData(
    uid,
    userdb.fname,
    userdb.lname,
    userdb.email,
    userdb.graduation_year,
    userdb.instruments,
    userdb.genres,
    userdb.experience,
    key
  );
  // add the user to the jam
  await get(child(dbRef, `/jams/${key}/`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const jamdb = snapshot.val();
        const newUsers = jamdb.users;
        newUsers.push(uid);
        writeJamData(key, jamdb.location, jamdb.genre, jamdb.blurb, newUsers);
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });

  userdb.jam = key;
  await updateUsers();
  await updateJams();

  jams[key].users.push(uid);

  loadJams();
}

function writeJamData(id, loc, gen, b, usrs) {
  set(ref(db, "jams/" + id), {
    location: loc,
    genre: gen,
    blurb: b,
    users: usrs,
    active: true,
  });
}

function writeUserData(id, f, l, email, y, inst, genr, exp, key) {
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

function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

async function leaveJam() {
  const currentJamId = userdb.jam;

  if (currentJamId != 0) {
    const currentJam = jams[currentJamId];

    writeUserData(
      uid,
      userdb.fname,
      userdb.lname,
      userdb.email,
      userdb.graduation_year,
      userdb.instruments,
      userdb.genres,
      userdb.experience,
      0
    );

    const updatedUsers = removeItemOnce(currentJam.users, uid);
    const activation = updatedUsers.length > 0;

    set(ref(db, "jams/" + currentJamId), {
      location: currentJam.location,
      genre: currentJam.genre,
      blurb: currentJam.blurb,
      users: updatedUsers,
      active: activation,
    });
  }

  await loadJams();
}

// On load, get campfires

onload = () => {
  loadJams();
};

setTimeout(() => {
  loadJams();
}, 500);

function autoUpdate() {
  setTimeout(() => {
    loadJams();
    autoUpdate();
  }, 10000);
}

autoUpdate();
