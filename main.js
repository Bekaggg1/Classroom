
const firebaseConfig = {
  apiKey: "AIzaSyA2HXbZ3wx7AueJfcfyXxaEgbd19rS92GU",
  authDomain: "classroomhub-b7fb2.firebaseapp.com",
  projectId: "classroomhub-b7fb2",

  storageBucket: "classroomhub-b7fb2.appspot.com",
  messagingSenderId: "738515755753",
  appId: "1:738515755753:web:8cbaba514b7f4d18d10678",
  measurementId: "G-BD9JP78661"
};


if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const storage = firebase.storage();

const sections = [
  { id: "materials", input: "materialsFile", list: "materialsList", icon: "📚" },
  { id: "documents", input: "documentsFile", list: "documentsList", icon: "📄" },
  { id: "homework", input: "homeworkFile", list: "homeworkList", icon: "📝" },
  { id: "notebooks", input: "notebooksFile", list: "notebooksList", icon: "📒" }
];


function createFileEntry(name, url, category) {
  const entry = document.createElement("div");
  entry.className = "file-entry";
 
  entry.dataset.url = url;
  entry.dataset.name = name;
  entry.style.cursor = 'pointer'; 

  entry.innerHTML = `
    <span>📄 <strong>${name}</strong></span>
    <span>
      <button class="delete-btn" data-name="${name}" data-category="${category}">Delete</button>
    </span>
  `;


  entry.addEventListener('click', (e) => {
    
    if (!e.target.classList.contains('delete-btn')) {
     
      window.open(entry.dataset.url, '_blank');
    }
  });

  return entry;
}

function uploadFile(file, category, list) {

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  const storageRef = storage.ref(`${category}/${file.name}`);
  const uploadTask = storageRef.put(file);

  
  const existingLoadingEntry = Array.from(list.children).find(child =>
      child.textContent.includes(`Uploading ${file.name}`)
  );
   if (existingLoadingEntry) {
        alert(`Upload for ${file.name} is already in progress or recently failed.`);
        return; 
   }


  const loading = document.createElement("div");
  loading.className = "file-entry";
  loading.textContent = `Uploading ${file.name}: 0%`; 
  list.appendChild(loading);

  uploadTask.on(
    firebase.storage.TaskEvent.STATE_CHANGED, 
    (snapshot) => {
      const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      loading.textContent = `Uploading ${file.name}: ${progress}%`;
    },
    (err) => {
      loading.textContent = `❌ Failed to upload ${file.name}`;
      console.error("Upload Error:", err); 
      alert(`Failed to upload ${file.name}. See console for details.`); 
     
    },
    () => {
      uploadTask.snapshot.ref.getDownloadURL().then((url) => {
        const entry = createFileEntry(file.name, url, category);
        
         if(loading.parentNode === list) {
             list.replaceChild(entry, loading);
             alert(`${file.name} uploaded successfully!`); 
         } else {
             
             list.appendChild(entry);
             alert(`${file.name} uploaded successfully (re-added to list)!`);
         }

      }).catch(err => {
           
           loading.textContent = `⚠️ Uploaded, but failed to get download URL for ${file.name}`;
           console.error("Get Download URL Error:", err);
           alert(`Upload complete, but failed to get URL for ${file.name}.`);
      });
    }
  );
}

function deleteFile(name, category, entry) {

  if (!confirm(`Are you sure you want to delete "${name}" from ${category}?`)) {
    return; 
  }

  const ref = storage.ref(`${category}/${name}`);
  ref.delete()
    .then(() => {
      entry.remove(); 
      alert(`"${name}" deleted successfully.`); 
    })
    .catch((error) => {
      alert("Failed to delete file.");
      console.error("Delete Error:", error); 
    });
}

function listFiles(category, container) {
  container.innerHTML = "<div class='file-entry'>Loading files...</div>"; 
  const listRef = storage.ref(category);
  listRef.listAll().then((res) => {
    container.innerHTML = ""; 
    if (res.items.length === 0) {
      container.innerHTML = "<div class='file-entry'>No files uploaded yet.</div>"; 
    } else {
     
      const filePromises = res.items.map(itemRef =>
        itemRef.getDownloadURL().then(url => ({ name: itemRef.name, url: url }))
      );

      Promise.all(filePromises).then(files => {
          files.sort((a, b) => a.name.localeCompare(b.name)); // Sort by name
          files.forEach(fileObj => createFileEntry(fileObj.name, fileObj.url, category)); 
      });
    }
  }).catch(error => {
      container.innerHTML = `<div class='file-entry'>❌ Failed to list files.</div>`;
      console.error("List Files Error:", error);
      alert("Failed to load files from storage.");
  });
}


sections.forEach(({ id, input, list }) => {
  const fileInput = document.getElementById(input);
  const fileList = document.getElementById(list);

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadFile(file, id, fileList);
    }
    fileInput.value = ""; 
  });

   // Use event delegation for delete buttons
  fileList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const name = e.target.getAttribute("data-name");
      const category = e.target.getAttribute("data-category");
      const entryElement = e.target.closest(".file-entry"); 
      if (name && category && entryElement) {
         deleteFile(name, category, entryElement);
      }
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    listFiles(id, fileList);
  });
});
