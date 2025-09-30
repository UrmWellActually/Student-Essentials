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
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

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
const auth = getAuth(app);

const addgoalsBlock = document.querySelector(".add-goals");
let goal, goalDescription;
const goalContainerEl = document.querySelector(".goal-containers");
const notificationEl = document.querySelector(".notification");

let currentUserId = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        addExistinggoals();
    } else {
        currentUserId = null;
        goalContainerEl.innerHTML = "";
        alert("Please log in to manage your goals.");
        window.location.href = "../authentication/login.html";
    }
});

async function submitGoal() {
    const goalInpEl = document.getElementById("goalInp");
    const desInpEl = document.getElementById("desInp");

    if (goalInpEl.value === "") {
        goalInpEl.placeholder = "Please enter a note";
        goalInpEl.style.border = "2px solid red";
        goalInpEl.style.outline = "2px solid red";
        setTimeout(() => {
            goalInpEl.placeholder = "Goal";
            goalInpEl.style.border = "2px solid black";
            goalInpEl.style.outline = "2px solid black";
        }, 1000);
        return;
    }
    if (goalInpEl.value.length >= 50) {
        goalInpEl.value = "Maximum characters for the notes is 50 words";
        goalInpEl.style.border = "2px solid red";
        goalInpEl.style.outline = "2px solid red";
        setTimeout(() => {
            goalInpEl.value = "";
            goalInpEl.style.border = "2px solid black";
            goalInpEl.style.outline = "2px solid black";
        }, 1000);
        return;
    }
    if (desInpEl.value.length >= 2000) {
        desInpEl.value = "Maximum characters for the description is 2000 words";
        desInpEl.style.border = "2px solid red";
        desInpEl.style.outline = "2px solid red";
        setTimeout(() => {
            desInpEl.value = "";
            desInpEl.style.border = "2px solid black";
            desInpEl.style.outline = "2px solid black";
        }, 1000);
        return;
    }

    if (!currentUserId) {
        alert("You must be logged in to add a note.");
        window.location.href = "../authentication/login.html";
        return;
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
                currentUserId,
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
                currentUserId,
                "notes",
                newGoalDocId
            );

            transaction.set(newGoalRef, {
                goal: goal,
                goalDescription: goalDescription,
                timeStamp: Date.now(),
                goalNumber: nextGoalNumber,
            });
        });

        addGoalEl(goal, goalDescription, newGoalDocId);
        notifyEmptyGoal();
    } catch (e) {
        alert("Oops! There was an error adding your note. Please try again.");
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
    deleteBtn.setAttribute("name", "close-outline");
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", () => {
        deleteGoal(docId, goalEl);
    });

    goalEl.appendChild(goalTitleEl);
    goalEl.appendChild(descriptionEl);
    goalEl.appendChild(deleteBtn);

    goalContainerEl.insertBefore(goalEl, goalContainerEl.firstChild);
}

async function deleteGoal(docId, goalElementToRemove) {
    if (!currentUserId) {
        alert("You must be logged in to delete a goal.");
        window.location.href = "../authentication/login.html";
        return;
    }

    if (
        !confirm(
            `Are you sure you don't want this note anymore? This action cannot be undone.`
        )
    ) {
        return;
    }

    try {
        await runTransaction(db, async (transaction) => {
            const goalCounterRef = doc(
                db,
                "users",
                currentUserId,
                "metadata",
                "goalCounter"
            );
            const goalCounterDoc = await transaction.get(goalCounterRef);

            const goalRef = doc(db, "users", currentUserId, "notes", docId);
            transaction.delete(goalRef);

            if (goalCounterDoc.exists()) {
                const currentActiveCount =
                    goalCounterDoc.data().activeGoalCount || 0;
                if (currentActiveCount > 0) {
                    transaction.update(goalCounterRef, {
                        activeGoalCount: currentActiveCount - 1,
                    });
                } else {
                    transaction.update(goalCounterRef, {
                        activeGoalCount: 0,
                    });
                }
            }
        });

        if (goalElementToRemove && goalElementToRemove.parentNode) {
            goalElementToRemove.parentNode.removeChild(goalElementToRemove);
            notifyEmptyGoal();
        } else {
            console.warn("Could not find goal element to remove from UI.");
        }
    } catch (error) {
        alert("There was an error deleting your note. Please try again.");
    }
}

function notifyEmptyGoal() {
    if (goalContainerEl.children.length === 0) {
        notificationEl.innerText =
            "There are no goals. Click the button below to add some notes.";
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

setTimeout(() => {
    notifyEmptyGoal();
}, 5000);

async function addExistinggoals() {
    if (!currentUserId) {
        return;
    }

    goalContainerEl.innerHTML = "";

    const goalsCollectionRef = collection(db, "users", currentUserId, "notes");
    const querySnapshot = await getDocs(goalsCollectionRef);

    if (querySnapshot.empty) {
        notificationEl.innerText =
            "There are no notes. Click the button below to add some notes.";
        notificationEl.style.display = "block";
    } else {
        notificationEl.style.display = "none";

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            addGoalEl(data.goal, data.goalDescription, doc.id);
        });
    }
}

