import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
    getFirestore,
    setDoc,
    doc,
    getDocs,
    collection,
    runTransaction,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js"; // <--- NEW: Import getAuth and onAuthStateChanged

const firebaseConfig = {
    apiKey: "AIzaSyCALRsEdIwM8g0BJeaVW51DBsWUdZ0lXJ0",
    authDomain: "student-essentials-fbd17.firebaseapp.com",
    projectId: "student-essentials-fbd17",
    storageBucket: "student-essentials-fbd17.firebasestorage.app",
    messagingSenderId: "1061657235972",
    appId: "1:1061657235972:web:597c4cf66ebb5a838b1b51",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // <--- NEW: Initialize Firebase Auth

const addgoalsBlock = document.querySelector(".add-goals");
let goal, goalDescription;
const goalContainerEl = document.querySelector(".goal-containers");
const notificationEl = document.querySelector(".notification"); // <--- Optimization: Get notification element once

let currentUserId = null; // <--- NEW: This will store the authenticated user's UID

// <--- NEW: Listen for changes in the user's authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, so we know who they are!
        currentUserId = user.uid;
        console.log("User logged in:", currentUserId);
        // Now that we have a valid user, load their goals
        addExistinggoals();
    } else {
        // No user is signed in. Clear the UI and inform the user.
        currentUserId = null;
        console.log("No user logged in.");
        goalContainerEl.innerHTML = ""; // Clear any displayed goals
        alert("Please log in to manage your goals.");
        // Optionally, redirect to login page here if not already on it
        // window.location.href = "../authentication/login.html";
    }
});
// <--- END NEW AUTHENTICATION LOGIC

async function submitGoal() {
    const goalInpEl = document.getElementById("goalInp");
    const desInpEl = document.getElementById("desInp");

    // Input validation (your existing code, adding 'return' statements for early exit)
    if (goalInpEl.value === "") {
        goalInpEl.placeholder = "Please enter a goal";
        goalInpEl.style.border = "2px solid red";
        goalInpEl.style.outline = "2px solid red";
        setTimeout(() => {
            goalInpEl.placeholder = "Goal";
            goalInpEl.style.border = "2px solid black";
            goalInpEl.style.outline = "2px solid black";
        }, 1000);
        return; // Stop execution
    }
    if (goalInpEl.value.length >= 30) {
        goalInpEl.value = "Maximum characters for the goal is 30 words";
        goalInpEl.style.border = "2px solid red";
        goalInpEl.style.outline = "2px solid red";
        setTimeout(() => {
            goalInpEl.value = "";
            goalInpEl.style.border = "2px solid black";
            goalInpEl.style.outline = "2px solid black";
        }, 1000);
        return; // Stop execution
    }
    if (desInpEl.value.length >= 50) {
        desInpEl.value = "Maximum characters for the description is 50 words";
        desInpEl.style.border = "2px solid red";
        desInpEl.style.outline = "2px solid red";
        setTimeout(() => {
            desInpEl.value = "";
            desInpEl.style.border = "2px solid black";
            desInpEl.style.outline = "2px solid black";
        }, 1000);
        return; // Stop execution
        m;
    }

    // <--- CRUCIAL CHANGE: Check if a user is authenticated using `currentUserId`
    if (!currentUserId) {
        alert("You must be logged in to add a goal.");
        window.location.href = "../authentication/login.html"; // Redirect to login
        return; // Stop the function
    }

    goal = goalInpEl.value;
    goalDescription = desInpEl.value;

    goalInpEl.value = "";
    desInpEl.value = "";

    addgoalsBlock.style.display = "none";

    try {
        let newGoalDocId;

        await runTransaction(db, async (transaction) => {
            const goalCounterRef = doc(
                db,
                "users",
                currentUserId, // <--- Use currentUserId from authenticated user
                "metadata",
                "goalCounter"
            );
            const goalCounterDoc = await transaction.get(goalCounterRef);

            let nextGoalNumber = 1;
            let activeGoalCount = 0;

            if (goalCounterDoc.exists()) {
                const data = goalCounterDoc.data();
                nextGoalNumber = (data.currentGoalNumber || 0) + 1;
                activeGoalCount = (data.activeGoalCount || 0) + 1;
            } else {
                activeGoalCount = 1;
            }

            transaction.set(goalCounterRef, {
                currentGoalNumber: nextGoalNumber,
                activeGoalCount: activeGoalCount,
            });

            newGoalDocId = `goal-${nextGoalNumber}`;
            const newGoalRef = doc(
                db,
                "users",
                currentUserId, // <--- Use currentUserId from authenticated user
                "goals",
                newGoalDocId
            );

            transaction.set(newGoalRef, {
                goal: goal,
                goalDescription: goalDescription,
                timeStamp: Date.now(),
                goalNumber: nextGoalNumber,
            });
        });

        console.log("Goal added successfully with sequential ID!");
        addGoalEl(goal, goalDescription, newGoalDocId);
        notifyEmptyGoal(); // Update notification after adding a goal
    } catch (e) {
        console.error("Failed to add goal with sequential ID: ", e);
        alert("Oops! There was an error adding your goal. Please try again.");
    }
}

function addgoals() {
    addgoalsBlock.style.display = "flex";
}

function addGoalEl(goalText, goalDescriptionText, docId) {
    let goalEl = document.createElement("div");
    goalEl.classList.add("goal");
    goalEl.dataset.docId = docId;

    let goalTitleEl = document.createElement("h1");
    goalTitleEl.innerText = goalText;

    let descriptionEl = document.createElement("p");
    descriptionEl.innerText = goalDescriptionText;

    let deleteBtn = document.createElement("ion-icon");
    deleteBtn.setAttribute("name", "checkmark-outline");
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", () => {
        deleteGoal(docId, goalEl);
    });

    goalEl.appendChild(goalTitleEl);
    goalEl.appendChild(descriptionEl);
    goalEl.appendChild(deleteBtn);

    goalContainerEl.appendChild(goalEl);

    // No need to hide notification here, notifyEmptyGoal will handle it
}

async function deleteGoal(docId, goalElementToRemove) {
    // <--- CRUCIAL CHANGE: Check if a user is authenticated using `currentUserId`
    if (!currentUserId) {
        alert("You must be logged in to delete a goal.");
        window.location.href = "../authentication/login.html"; // Redirect to login
        return; // Stop the function
    }

    if (
        !confirm(
            `Are you sure you have completed this goal? This action cannot be undone.`
        )
    ) {
        return;
    }

    try {
        await runTransaction(db, async (transaction) => {
            const goalCounterRef = doc(
                db,
                "users",
                currentUserId, // <--- Use currentUserId from authenticated user
                "metadata",
                "goalCounter"
            );
            const goalCounterDoc = await transaction.get(goalCounterRef);

            const goalRef = doc(db, "users", currentUserId, "goals", docId); // <--- Use currentUserId
            transaction.delete(goalRef);

            if (goalCounterDoc.exists()) {
                const currentActiveCount =
                    goalCounterDoc.data().activeGoalCount || 0;
                if (currentActiveCount > 0) {
                    transaction.update(goalCounterRef, {
                        activeGoalCount: currentActiveCount - 1,
                    });
                } else {
                    // Ensure it doesn't go below zero
                    transaction.update(goalCounterRef, {
                        activeGoalCount: 0,
                    });
                }
            }
        });

        console.log(
            `Goal with ID ${docId} successfully deleted from Firestore and active count updated!`
        );

        if (goalElementToRemove && goalElementToRemove.parentNode) {
            // After removing a goal
            goalElementToRemove.parentNode.removeChild(goalElementToRemove);
            notifyEmptyGoal();
        } else {
            console.warn("Could not find goal element to remove from UI.");
        }
    } catch (error) {
        console.error("Error deleting goal or updating count: ", error);
        alert("There was an error deleting your goal. Please try again.");
    }
}

function notifyEmptyGoal() {
    // Check the actual number of goals in the container
    if (goalContainerEl.children.length === 0) {
        notificationEl.innerText =
            "There are no goals. Click the button below to add some goals.";
        notificationEl.style.display = "block";
    } else {
        notificationEl.style.display = "none";
    }
}

const closeAddgoalsRedBtn = document.querySelector(".close");
closeAddgoalsRedBtn.addEventListener("click", () => {
    addgoalsBlock.style.display = "none";
});

document.querySelector(".add-goals-btn").addEventListener("click", addgoals);
document.getElementById("submitBtn").addEventListener("click", submitGoal);

notifyEmptyGoal();

async function addExistinggoals() {
    // <--- CRUCIAL CHANGE: Check if a user is authenticated using `currentUserId`
    if (!currentUserId) {
        console.log("No user logged in, cannot fetch existing goals.");
        return; // Stop the function
    }

    // <--- NEW: Clear existing goals from the UI before fetching new ones
    // This prevents duplicates if the function is called multiple times (e.g., on re-login)
    goalContainerEl.innerHTML = "";

    const goalsCollectionRef = collection(db, "users", currentUserId, "goals"); // <--- Use currentUserId
    const querySnapshot = await getDocs(goalsCollectionRef);

    if (querySnapshot.empty) {
        console.log("No goals found for this user.");
        notificationEl.innerText =
            "There are no goals. Click the button below to add some goals.";
        notificationEl.style.display = "block";
    } else {
        notificationEl.style.display = "none";

        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            const data = doc.data();
            addGoalEl(data.goal, data.goalDescription, doc.id);
        });
    }
    notifyEmptyGoal()
}

// <--- REMOVED: Initial call to addExistinggoals is now handled by the onAuthStateChanged listener
// addExistinggoals();
