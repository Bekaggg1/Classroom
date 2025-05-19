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

const sections = [
  { id: "materials", input: "materialsFile", list: "materialsList" },
  { id: "documents", input: "documentsFile", list: "documentsList" },
  { id: "homework", input: "homeworkFile", list: "homeworkList" }
];

function createFileEntry(name, url, category) {
  const entry = document.createElement("div");
  entry.className = "file-entry";
  entry.innerHTML = `
    <span>📄 <strong>${name}</strong></span>
    <span>
      <a href="${url}" target="_blank" rel="noopener">[Open]</a>
      <button class="delete-btn" data-name="${name}" data-category="${category}">Delete</button>
    </span>
  `;
  return entry;
}

function uploadFile(file, category, list) {
  const storageRef = storage.ref(`${category}/${file.name}`);
  const uploadTask = storageRef.put(file);

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

function deleteFile(name, category, entry) {
  if (!confirm(`Are you sure you want to delete "${name}" from ${category}?`)) return;
  const ref = storage.ref(`${category}/${name}`);
  ref.delete()
    .then(() => {
      entry.remove();
      alert(`"${name}" deleted successfully.`);
    })
    .catch((error) => {
      alert("Failed to delete file.");
      console.error(error);
    });
}

function listFiles(category, container) {
  container.innerHTML = "<div>Loading...</div>";
  const listRef = storage.ref(category);
  listRef.listAll().then((res) => {
    container.innerHTML = "";
    if (res.items.length === 0) {
      container.innerHTML = "<div>No files uploaded yet.</div>";
    }
    res.items.forEach((itemRef) => {
      itemRef.getDownloadURL().then((url) => {
        const entry = createFileEntry(itemRef.name, url, category);
        container.appendChild(entry);
      });
    });
  });
}

sections.forEach(({ id, input, list }) => {
  const fileInput = document.getElementById(input);
  const fileList = document.getElementById(list);

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file, id, fileList);
    fileInput.value = ""; // Reset input
  });

  fileList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const name = e.target.getAttribute("data-name");
      const category = e.target.getAttribute("data-category");
      deleteFile(name, category, e.target.closest(".file-entry"));
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    listFiles(id, fileList);
  });
});
