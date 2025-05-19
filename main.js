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

// createFileEntry for local storage - makes entry div clickable
function createFileEntry(fileObj, category, list) {
  const entry = document.createElement("div");
  entry.className = "file-entry";
  // Store the URL and name on the entry element for easy access in click handler
  entry.dataset.url = fileObj.url;
  entry.dataset.name = fileObj.name;
  entry.style.cursor = 'pointer'; // Add a pointer cursor

  entry.innerHTML = `
    <span>📄 <strong>${fileObj.name}</strong></span>
    <span>
      <button class="delete-btn" data-name="${fileObj.name}" data-category="${category}">Delete</button>
    </span>
  `;

  // Add click listener to the entry div to open the file
  entry.addEventListener('click', (e) => {
    // Check if the click target is NOT the delete button
    if (!e.target.classList.contains('delete-btn')) {
      // Open the file URL (Data URL) in a new tab
      // Using window.open with a Data URL might depend on browser/file type.
      // A download link is more reliable for saving the file locally.
      // Let's use a download link behavior on click.
      const downloadLink = document.createElement('a');
      downloadLink.href = entry.dataset.url;
      downloadLink.download = entry.dataset.name;
      downloadLink.style.display = 'none'; // Hide the link
      document.body.appendChild(downloadLink); // Append to body
      downloadLink.click(); // Simulate click
      document.body.removeChild(downloadLink); // Clean up
    }
  });

  return entry;
}


// listFiles for local storage
function listFiles(category, list) {
  list.innerHTML = ""; // Clear the current list
  const files = getFiles(category);
  if (files.length === 0) {
    list.innerHTML = "<div class='file-entry'>No files uploaded yet.</div>"; // Added class for consistent styling
  } else {
    // For local storage, files are already objects with name and url
    files.forEach(fileObj => createFileEntry(fileObj, category, list));
  }
}

// uploadFile for local storage (shows "Loading...")
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
      alert(`File "${file.name}" already exists in ${category}.`);
      return; // Stop here if file exists
    }

    files.push({ name: file.name, url: e.target.result }); // Store as Data URL
    saveFiles(category, files);
    listFiles(category, list); // Re-render the list to show the new file
  };

  reader.onerror = function() {
    loading.textContent = `❌ Failed to read ${file.name}`;
    console.error("FileReader Error:", reader.error);
  };

  // Start reading the file as a Data URL
  reader.readAsDataURL(file);
}

// Event listeners for file inputs and delete buttons
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

   // Use event delegation for delete buttons
  fileList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const name = e.target.getAttribute("data-name");
      const entryElement = e.target.closest(".file-entry"); // Get the parent file entry element
      if (name && entryElement) { // Ensure name and element are found
         // Local storage delete
        let files = getFiles(id);
        files = files.filter(f => f.name !== name);
        saveFiles(id, files);
        entryElement.remove(); // Remove the entry from the UI
         alert(`"${name}" deleted locally.`); // Local success message
      }
    }
  });

  // Initial listing of files when the DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    listFiles(id, fileList);
  });
});

