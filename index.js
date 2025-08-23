import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
    getFirestore,
    getDoc,
    doc,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCALRsEdIwM8g0BJeaVW51DBsWUdZ0lXJ0",
    authDomain: "student-essentials-fbd17.firebaseapp.com",
    projectId: "student-essentials-fbd17",
    storageBucket: "student-essentials-fbd17.firebasestorage.app",
    messagingSenderId: "1061657235972",
    appId: "1:1061657235972:web:597c4cf66ebb5a838b1b51",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();

const calculatorBtn = document.querySelector(".calculator"),
    schoolEventsBtn = document.querySelector(".school-events"),
    goalTrackerBtn = document.querySelector(".goal-tracker"),
    noteTakerBtn = document.querySelector(".goals-taker"),
    registerBtn = document.querySelector(".register");

onAuthStateChanged(auth, (user) => {
    const loggedInUserId = localStorage.getItem("loggedInUserId");
    const authBtn = document.querySelector(".login");
    const authTxt = document.querySelector(".auth");
    const regisP = document.querySelector(".regisP");

    authBtn.addEventListener("click", () => {
        window.location.href = "authentication/login.html";
    });

    if (loggedInUserId) {
        const docRef = doc(db, "users", loggedInUserId);

        getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const authenticationBtn = document.querySelectorAll(
                    ".authenticate-anchor-tags"
                );

                authenticationBtn.forEach((element) => {
                    element.style.display = "none";
                });

                const userEl = document.querySelector(".sign-out-element");
                userEl.innerText = userData.username;
                userEl.style.display = "block";
                userEl.style.fontSize = "1.4em";
                userEl.style.marginLeft = "15px";

                authBtn.classList.replace("login", "sign-out");
                authTxt.innerText = "Sign Out";
                regisP.innerText = "Create account";
                authBtn.addEventListener("click", () => {
                    window.location.href = "sign-out/sign-out.html";
                });
            }
        });
    }
});

calculatorBtn.addEventListener("click", () => {
    window.location.href = "calculator/calculator.html";
});

schoolEventsBtn.addEventListener("click", () => {
    window.location.href = "school-events/school-events.html";
});

goalTrackerBtn.addEventListener("click", () => {
    window.location.href = "goal-tracker/goal-tracker.html";
});

noteTakerBtn.addEventListener("click", () => {
    window.location.href = "note-taker/note-taker.html";
});

registerBtn.addEventListener("click", () => {
    window.location.href = "authentication/register.html";
});
