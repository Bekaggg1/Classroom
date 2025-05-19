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
  list.innerHTML = "";
  const files = getFiles(category);
  if (files.length === 0) {
    list.innerHTML = "<div>No files uploaded yet.</div>";
  } else {
    files.forEach(fileObj => createFileEntry(fileObj, category, list));
  }
}

function uploadFile(file, category, list) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const files = getFiles(category);
    files.push({ name: file.name, url: e.target.result });
    saveFiles(category, files);
    listFiles(category, list);
  };
  reader.readAsDataURL(file);
}

sections.forEach(({ id, input, list }) => {
  const fileInput = document.getElementById(input);
  const fileList = document.getElementById(list);

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file, id, fileList);
    fileInput.value = "";
  });

  fileList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const name = e.target.getAttribute("data-name");
      let files = getFiles(id);
      files = files.filter(f => f.name !== name);
      saveFiles(id, files);
      listFiles(id, fileList);
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    listFiles(id, fileList);
  });
});
