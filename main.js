// app.js

// Firebase config (ensure your keys match your actual Firebase project)
const firebaseConfig = {
  apiKey: "AIzaSyA2HXbZ3wx7AueJfcfyXxaEgbd19rS92GU",
  authDomain: "classroomhub-b7fb2.firebaseapp.com",
  projectId: "classroomhub-b7fb2",
  storageBucket: "classroomhub-b7fb2.appspot.com",
  messagingSenderId: "738515755753",
  appId: "1:738515755753:web:8cbaba514b7f4d18d10678",
  measurementId: "G-BD9JP78661"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

// DOM Elements
const materialsInput = document.getElementById("materialsFile");
const homeworkInput = document.getElementById("homeworkFile");
const materialsList = document.getElementById("materialsList");
const homeworkList = document.getElementById("homeworkList");

function uploadFile(file, category) {
  if (!file) return;
  const storageRef = storage.ref(`${category}/${file.name}`);
  const uploadTask = storageRef.put(file);

  // Progress UI
  const progress = document.createElement("div");
  progress.textContent = `Uploading ${file.name}: 0%`;
  (category === "materials" ? materialsList : homeworkList).appendChild(progress);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const percent = Math.floor(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      progress.textContent = `Uploading ${file.name}: ${percent}%`;
    },
    (error) => {
      console.error("Upload failed:", error);
      progress.textContent = `❌ Failed to upload ${file.name}`;
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        progress.innerHTML = `✅ ${file.name} <a href="${downloadURL}" target="_blank">[Open]</a>`;
      });
    }
  );
}

// Event listeners
materialsInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  uploadFile(file, "materials");
});

homeworkInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  uploadFile(file, "homework");
});

// Optional: List existing files (on page load)
function listFiles(category, container) {
  const listRef = storage.ref(category);
  listRef.listAll().then((res) => {
    res.items.forEach((itemRef) => {
      itemRef.getDownloadURL().then((url) => {
        const link = document.createElement("div");
        link.innerHTML = `📄 ${itemRef.name} <a href="${url}" target="_blank">[Open]</a>`;
        container.appendChild(link);
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  listFiles("materials", materialsList);
  listFiles("homework", homeworkList);
});
