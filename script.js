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

// Helper upload function
function uploadFile(fileInputId, folder, statusId) {
  const fileInput = document.getElementById(fileInputId);
  const statusText = document.getElementById(statusId);
  const file = fileInput.files[0];

  if (!file) {
    statusText.textContent = "No file selected.";
    return;
  }

  const storageRef = storage.ref(`${folder}/${file.name}`);
  const uploadTask = storageRef.put(file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const percent = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0);
      statusText.textContent = `Uploading: ${percent}%`;
    },
    (error) => {
      console.error("Upload failed:", error);
      statusText.textContent = `Upload failed: ${error.message}`;
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        statusText.innerHTML = `✅ Uploaded successfully: <a href="${downloadURL}" target="_blank">View File</a>`;
      });
    }
  );
}

// Attach upload functions to buttons
document.getElementById("uploadMaterialBtn").addEventListener("click", () => {
  uploadFile("materialInput", "materials", "materialStatus");
});

document.getElementById("uploadHomeworkBtn").addEventListener("click", () => {
  uploadFile("homeworkInput", "homework", "homeworkStatus");
});
