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

// Upload helper
function uploadFile(inputId, folder, statusId, listId) {
  const input = document.getElementById(inputId);
  const file = input.files[0];
  const status = document.getElementById(statusId);

  if (!file) return (status.textContent = "❌ No file selected.");

  const ref = storage.ref(`${folder}/${file.name}`);
  const task = ref.put(file);

  task.on(
    "state_changed",
    (snap) => {
      status.textContent = `Uploading: ${(snap.bytesTransferred / snap.totalBytes * 100).toFixed(0)}%`;
    },
    (err) => {
      status.textContent = `❌ Error: ${err.message}`;
    },
    () => {
      status.textContent = "✅ Upload complete!";
      listFiles(folder, listId);
    }
  );
}

// List files
function listFiles(folder, listId) {
  const listEl = document.getElementById(listId);
  listEl.innerHTML = "";

  storage.ref(folder).listAll().then((res) => {
    res.items.forEach((itemRef) => {
      itemRef.getDownloadURL().then((url) => {
        const li = document.createElement("li");

        const link = document.createElement("a");
        link.href = url;
        link.textContent = itemRef.name;
        link.target = "_blank";

        const del = document.createElement("button");
        del.textContent = "Delete";
        del.onclick = () => {
          itemRef.delete().then(() => listFiles(folder, listId));
        };

        li.appendChild(link);
        li.appendChild(del);
        listEl.appendChild(li);
      });
    });
  });
}

// Initial load
listFiles("materials", "materialList");
listFiles("homework", "homeworkList");

// Events
document.getElementById("uploadMaterialBtn").addEventListener("click", () => {
  uploadFile("materialInput", "materials", "materialStatus", "materialList");
});

document.getElementById("uploadHomeworkBtn").addEventListener("click", () => {
  uploadFile("homeworkInput", "homework", "homeworkStatus", "homeworkList");
});
