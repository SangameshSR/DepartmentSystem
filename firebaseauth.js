import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Initialize Firebase
const firebaseConfig = { /* Your Config */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.textContent = message;
    setTimeout(() => messageDiv.style.display = "none", 5000);
}

// Toggle between Sign In and Sign Up
document.getElementById('toggleSignUp').addEventListener('click', () => {
    document.getElementById('signInForm').classList.add('hidden');
    document.getElementById('signUpForm').classList.remove('hidden');
    document.getElementById('toggleSignIn').classList.remove('active');
    document.getElementById('toggleSignUp').classList.add('active');
});

document.getElementById('toggleSignIn').addEventListener('click', () => {
    document.getElementById('signUpForm').classList.add('hidden');
    document.getElementById('signInForm').classList.remove('hidden');
    document.getElementById('toggleSignIn').classList.add('active');
    document.getElementById('toggleSignUp').classList.remove('active');
});

// Sign Up Logic
document.getElementById('submitSignUp').addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            return setDoc(doc(db, "users", user.uid), {
                firstName,
                lastName,
                email
            });
        })
        .then(() => showMessage('Account created successfully!', 'signUpMessage'))
        .catch((error) => showMessage(error.message, 'signUpMessage'));
});

// Sign In Logic
document.getElementById('submitSignIn').addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => showMessage('Login successful!', 'signInMessage'))
        .catch((error) => showMessage(error.message, 'signInMessage'));
});
