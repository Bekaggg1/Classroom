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

function createFileEntry(name, url, category) {
  const fileEntry = document.createElement("div");
  fileEntry.classList.add("file-entry");
  fileEntry.style.backgroundColor = category === "materials" ? "#2d3748" : "#1a202c";
  fileEntry.style.color = "#edf2f7";
  fileEntry.style.padding = "8px";
  fileEntry.style.borderRadius = "8px";
  fileEntry.style.margin = "4px 0";
  fileEntry.innerHTML = `📄 <strong>${name}</strong> <a href="${url}" target="_blank" style="color:#90cdf4; margin-left: 10px">[Open]</a>`;
  return fileEntry;
}

function uploadFile(file, category) {
  if (!file) return;
  const storageRef = storage.ref(`${category}/${file.name}`);
  const uploadTask = storageRef.put(file);

  const progressWrapper = document.createElement("div");
  progressWrapper.classList.add("file-entry");
  progressWrapper.style.backgroundColor = category === "materials" ? "#2d3748" : "#1a202c";
  progressWrapper.style.color = "#edf2f7";
  progressWrapper.style.padding = "8px";
  progressWrapper.style.borderRadius = "8px";
  progressWrapper.style.margin = "4px 0";
  const progressText = document.createElement("span");
  progressText.textContent = `Uploading ${file.name}: 0%`;
  progressWrapper.appendChild(progressText);
  (category === "materials" ? materialsList : homeworkList).appendChild(progressWrapper);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const percent = Math.floor(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      progressText.textContent = `Uploading ${file.name}: ${percent}%`;
    },
    (error) => {
      console.error("Upload failed:", error);
      progressText.textContent = `❌ Failed to upload ${file.name}`;
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        const newFile = createFileEntry(file.name, downloadURL, category);
        progressWrapper.replaceWith(newFile);
      });
    }
  );
}

materialsInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  uploadFile(file, "materials");
});

homeworkInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  uploadFile(file, "homework");
});

function listFiles(category, container) {
  const listRef = storage.ref(category);
  listRef.listAll().then((res) => {
    res.items.forEach((itemRef) => {
      itemRef.getDownloadURL().then((url) => {
        const entry = createFileEntry(itemRef.name, url, category);
        container.appendChild(entry);
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  listFiles("materials", materialsList);
  listFiles("homework", homeworkList);
});
