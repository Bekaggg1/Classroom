// Firebase config
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

  const nameSpan = document.createElement("span");
  nameSpan.innerHTML = `📄 <strong>${name}</strong>`;
  
  const openLink = document.createElement("a");
  openLink.href = url;
  openLink.target = "_blank";
  openLink.textContent = "[Open]";
  openLink.style.marginLeft = "10px";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.onclick = () => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      firebase.storage().ref(`${category}/${name}`).delete().then(() => {
        fileEntry.remove();
      }).catch((err) => {
        alert("❌ Failed to delete: " + err.message);
      });
    }
  };

  fileEntry.appendChild(nameSpan);
  fileEntry.appendChild(openLink);
  fileEntry.appendChild(deleteBtn);
  fileEntry.style.backgroundColor = category === "materials" ? "#2d3748" : "#1a202c";

  return fileEntry;
}

function uploadFile(file, category) {
  if (!file) return;
  const storageRef = storage.ref(`${category}/${file.name}`);
  const uploadTask = storageRef.put(file);

  const progressWrapper = document.createElement("div");
  progressWrapper.classList.add("file-entry");
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
