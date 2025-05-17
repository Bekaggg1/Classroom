const uploadForm = document.getElementById('uploadForm');
const cardContainer = document.querySelector('.card-container');

// Load saved materials from localStorage when page loads
window.addEventListener('DOMContentLoaded', loadMaterials);

uploadForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const title = uploadForm.querySelector('input[placeholder="Title"]').value.trim();
  const subject = uploadForm.querySelector('input[placeholder^="Subject"]').value.trim();
  const link = uploadForm.querySelector('input[type="url"]').value.trim();
  const fileInput = uploadForm.querySelector('input[type="file"]');
  const file = fileInput.files[0];

  if (!title || !subject) {
    alert('Please fill in Title and Subject');
    return;
  }

  createCard(title, subject, link, file);

  // Reset form
  uploadForm.reset();
});

function createCard(title, subject, link, file) {
  const card = document.createElement('div');
  card.className = 'card';

  let fileHTML = '';
  if (file) {
    fileHTML = `<p><strong>File:</strong> ${file.name}</p>`;
  }

  let linkHTML = '';
  if (link) {
    linkHTML = `<p><a href="${link}" target="_blank" rel="noopener noreferrer">Related Link</a></p>`;
  }

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

  cardContainer.appendChild(card);
  saveMaterials();
}

function saveMaterials() {
  const cards = [...cardContainer.children];
  const data = cards.map(card => {
    return {
      title: card.querySelector('h3').textContent,
      subject: card.querySelector('p').textContent,
      link: card.querySelector('a')?.href || '',
      fileName: card.querySelector('p strong') ? card.querySelector('p strong').nextSibling.textContent.trim() : ''
    };
  });
  localStorage.setItem('materials', JSON.stringify(data));
}

function loadMaterials() {
  const data = JSON.parse(localStorage.getItem('materials') || '[]');
  data.forEach(({title, subject, link, fileName}) => {
    const fakeFile = fileName ? { name: fileName } : null;
    createCard(title, subject, link, fakeFile);
  });
}
