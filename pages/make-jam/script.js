// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-analytics.js";
import { getDatabase, ref, set, child, get } from "../../node_modules/firebase/firebase-database.js";

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

// Read DB
const db = getDatabase();
const dbRef = ref(db);
var jams = []

get(child(dbRef, `/jams/`)).then((snapshot) => {
  if (snapshot.exists()) {
    jams = snapshot.val()
    console.log(jams)
  } else {
    console.log("No data available");
  }
}).catch((error) => {
  console.error(error);
});

function generateUsersList(users){
    var userList = ''
    users.map((user) => {userList += `<li>${user}</li>`})
    return userList
}

function loadJams() {
  jams.map((jam) => {
    document.body.innerHTML +=
      `<div>
    <p>Location: ${jam.location}</p>
    <p>Jammers: </p>
    <ul>
    ${ generateUsersList(jam.users) }
    </ul>
    <p>Genre: ${jam.genre}</p>
    
    </div>`

    console.log(jam)
  })
}


function writeUserData(userId, name, email) {
  const formOutput = $('#userForm').serialize();
  set(ref(db, 'users/' + userId), {
    username: name,
    email: email
  });
}
function writeJamData(jamId, location, userId, genre, time, blurb) {
  set(ref(db, 'jams/' + jamId), {
    location: location,
    users: [userId],
    genre: genre,
    time_started: time,
    blurb: blurb
  })
}



// writeJamData(0, "your mom's house", 0, "jazz", 0, "you like jazz?")
// writeJamData(1, "smitty b", 1, "rock", 1, "people always take it for granite")

// writeUserData(0, "PENIS", "PENIS@PENIS.COM");



// Buttons
document.getElementById("loadJams").addEventListener("click", () => { loadJams() })

