import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
    getFirestore,
    setDoc,
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

const register = document.getElementById("register");
register.addEventListener("click", (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value,
        email = document.getElementById("email").value,
        password = document.getElementById("password").value;

    if (username.length >= 12) {
        const usernameEl = document.getElementById("username");

        usernameEl.value = "Exceeded maximum username length of 12 characters";
        usernameEl.style.border = "2px solid red";
        usernameEl.style.outline = "2px solid red";

        setTimeout(() => {
            usernameEl.setAttribute(
                "placeholder",
                ""
            );
            usernameEl.style.border = "1px solid black";
            usernameEl.style.outline = "none";
        }, 5000);
    } else {
        const auth = getAuth();
        const db = getFirestore();

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userData = {
                    username: username,
                    email: email,
                };

                alert("Account created successfully. Please login!");
                const docRef = doc(db, "users", user.uid);
                setDoc(docRef, userData)
                    .then(() => {
                        window.location.href = "login.html";
                    })
                    .catch(() => {
                        alert("Error writing document", error);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;

                if (errorCode == "auth/email-already-in-use") {
                    alert("Email Adress Already Exists!");
                } else {
                    alert("Unable to create user, please try again later.");
                }
            });
    }
});
