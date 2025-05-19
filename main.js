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

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

const materialsInput = document.getElementById("materialsFile");
const homeworkInput = document.getElementById("homeworkFile");
const materialsList = document.getElementById("materialsList");
const homeworkList = document.getElementById("homeworkList");

function createFileEntry(name, url, category) {
  const entry = document.createElement("div");
  entry.className = "file-entry";
  entry.innerHTML = `
    <span>📄 <strong>${name}</strong></span>
    <span>
      <a href="${url}" target="_blank">[Open]</a>
      <button onclick="deleteFile('${name}', '${category}', this)">Delete</button>
    </span>
  `;
  return entry;
}

function uploadFile(file, category) {
  const storageRef = storage.ref(`${category}/${file.name}`);
  const uploadTask = storageRef.put(file);

  const list = category === "materials" ? materialsList : homeworkList;
  const loading = document.createElement("div");
  loading.className = "file-entry";
  loading.textContent = `Uploading ${file.name}: 0%`;
  list.appendChild(loading);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      loading.textContent = `Uploading ${file.name}: ${progress}%`;
    },
    (err) => {
      loading.textContent = `❌ Failed to upload ${file.name}`;
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((url) => {
        const entry = createFileEntry(file.name, url, category);
        list.replaceChild(entry, loading);
      });
    }
  );
}

function deleteFile(name, category, button) {
  const ref = storage.ref(`${category}/${name}`);
  ref.delete()
    .then(() => {
      const entry = button.closest(".file-entry");
      entry.remove();
    })
    .catch((error) => {
      alert("Failed to delete file.");
      console.error(error);
    });
}

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

materialsInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) uploadFile(file, "materials");
});

homeworkInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) uploadFile(file, "homework");
});

document.addEventListener("DOMContentLoaded", () => {
  listFiles("materials", materialsList);
  listFiles("homework", homeworkList);
});
