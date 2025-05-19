const sections = [
  { id: "materials", input: "materialsFile", list: "materialsList" },
  { id: "documents", input: "documentsFile", list: "documentsList" },
  { id: "homework", input: "homeworkFile", list: "homeworkList" },
  { id: "notebooks", input: "notebooksFile", list: "notebooksList" }
];

function getFiles(category) {
  return JSON.parse(localStorage.getItem(`files_${category}`) || "[]");
}

function saveFiles(category, files) {
  localStorage.setItem(`files_${category}`, JSON.stringify(files));
}

function createFileEntry(fileObj, category, list) {
  const entry = document.createElement("div");
  entry.className = "file-entry";
  entry.innerHTML = `
    <span>📄 <strong>${fileObj.name}</strong></span>
    <span>
      <a href="${fileObj.url}" download="${fileObj.name}" target="_blank">[Open]</a>
      <button class="delete-btn" data-name="${fileObj.name}" data-category="${category}">Delete</button>
    </span>
  `;
  list.appendChild(entry);
}

function listFiles(category, list) {
  list.innerHTML = ""; // Clear the current list
  const files = getFiles(category);
  if (files.length === 0) {
    list.innerHTML = "<div class='file-entry'>No files uploaded yet.</div>"; // Added class for consistent styling
  } else {
    files.forEach(fileObj => createFileEntry(fileObj, category, list));
  }
}

// UPDATED uploadFile function
function uploadFile(file, category, list) {
  const reader = new FileReader();

  // Show a loading message immediately
  const loading = document.createElement("div");
  loading.className = "file-entry";
  loading.textContent = `Loading ${file.name}...`; // Simple loading message
  list.appendChild(loading);

  reader.onload = function(e) {
    // Remove the loading message after reading
    loading.remove();

    const files = getFiles(category);
    // Check if file with the same name already exists to prevent duplicates
    const existingFileIndex = files.findIndex(f => f.name === file.name);

    if (existingFileIndex > -1) {
      // Optionally, alert the user or handle duplicate differently
      alert(`File "${file.name}" already exists in ${category}.`);
      return; // Stop here if file exists
    }

    files.push({ name: file.name, url: e.target.result });
    saveFiles(category, files);
    listFiles(category, list); // Re-render the list to show the new file
  };

  reader.onerror = function() {
    loading.textContent = `❌ Failed to read ${file.name}`;
  };

  // Start reading the file
  reader.readAsDataURL(file);
}


sections.forEach(({ id, input, list }) => {
  const fileInput = document.getElementById(input);
  const fileList = document.getElementById(list);

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadFile(file, id, fileList);
    }
    fileInput.value = ""; // Reset input field after selection
  });

  fileList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const name = e.target.getAttribute("data-name");
      const entryElement = e.target.closest(".file-entry"); // Get the parent file entry element
      if (name && entryElement) { // Ensure name and element are found
        let files = getFiles(id);
        files = files.filter(f => f.name !== name);
        saveFiles(id, files);
        entryElement.remove(); // Remove the entry from the UI
      }
    }
  });

  // Load files when the section becomes visible or the DOM is ready
  // Using a general DOMContentLoaded for simplicity, can be improved with tab switching
  document.addEventListener("DOMContentLoaded", () => {
    listFiles(id, fileList);
  });
});
