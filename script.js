// Materials elements
const uploadForm = document.getElementById('uploadForm');
const materialsContainer = document.getElementById('materials-container');

// Homework elements
const homeworkForm = document.getElementById('homeworkForm');
const homeworkContainer = document.getElementById('homework-container');

// Load both lists on page load
window.addEventListener('DOMContentLoaded', () => {
  loadMaterials();
  loadHomework();
});

// Materials form submit
uploadForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('material-title').value.trim();
  const subject = document.getElementById('material-subject').value.trim();
  const link = document.getElementById('material-link').value.trim();
  const fileInput = document.getElementById('material-file');
  const file = fileInput.files[0];

  if (!title || !subject) {
    alert('Please fill in Title and Subject for materials.');
    return;
  }

  createMaterialCard(title, subject, link, file);
  uploadForm.reset();
});

// Homework form submit
homeworkForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = document.getElementById('homework-title').value.trim();
  const subject = document.getElementById('homework-subject').value.trim();

  if (!title || !subject) {
    alert('Please fill in Homework Title and Subject.');
    return;
  }

  createHomeworkCard(title, subject);
  homeworkForm.reset();
});

// Create material card and save
function createMaterialCard(title, subject, link, file) {
  const card = document.createElement('div');
  card.className = 'card';

  const fileHTML = file ? `<p><strong>File:</strong> ${file.name}</p>` : '';
  const linkHTML = link ? `<p><a href="${link}" target="_blank" rel="noopener noreferrer">Related Link</a></p>` : '';

  card.innerHTML = `
    <h3>${title}</h3>
    <p>${subject}</p>
    ${fileHTML}
    ${linkHTML}
    <button class="delete-btn">Delete</button>
  `;

  card.querySelector('.delete-btn').addEventListener('click', () => {
    card.remove();
    saveMaterials();
  });

  materialsContainer.appendChild(card);
  saveMaterials();
}

// Create homework card and save
function createHomeworkCard(title, subject) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h3>${title}</h3>
    <p>${subject}</p>
    <button class="delete-btn">Delete</button>
  `;

  card.querySelector('.delete-btn').addEventListener('click', () => {
    card.remove();
    saveHomework();
  });

  homeworkContainer.appendChild(card);
  saveHomework();
}

// Save materials to localStorage
function saveMaterials() {
  const cards = [...materialsContainer.children];
  const data = cards.map(card => ({
    title: card.querySelector('h3').textContent,
    subject: card.querySelector('p').textContent,
    link: card.querySelector('a')?.href || '',
    fileName: card.querySelector('p strong') ? card.querySelector('p strong').nextSibling.textContent.trim() : ''
  }));
  localStorage.setItem('materials', JSON.stringify(data));
}

// Load materials from localStorage
function loadMaterials() {
  const data = JSON.parse(localStorage.getItem('materials') || '[]');
  data.forEach(({ title, subject, link, fileName }) => {
    const fakeFile = fileName ? { name: fileName } : null;
    createMaterialCard(title, subject, link, fakeFile);
  });
}

// Save homework to localStorage
function saveHomework() {
  const cards = [...homeworkContainer.children];
  const data = cards.map(card => ({
    title: card.querySelector('h3').textContent,
    subject: card.querySelector('p').textContent,
  }));
  localStorage.setItem('homework', JSON.stringify(data));
}

// Load homework from localStorage
function loadHomework() {
  const data = JSON.parse(localStorage.getItem('homework') || '[]');
  data.forEach(({ title, subject }) => {
    createHomeworkCard(title, subject);
  });
}
