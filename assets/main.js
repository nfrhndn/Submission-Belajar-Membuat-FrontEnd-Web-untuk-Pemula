/* =============================
   KONSTANTA & STATE GLOBAL
============================= */
const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render-book';

let books = [];
let isEditing = false;
let editingBookId = null;

/* =============================
   STORAGE HELPER
============================= */
function isStorageAvailable() {
  if (typeof Storage === 'undefined') {
    alert('Browser tidak mendukung localStorage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  if (serializedData) {
    books = JSON.parse(serializedData);
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

/* =============================
   DATA HELPER
============================= */
function generateId() {
  return Number(new Date());
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: Number(year),
    isComplete,
  };
}

function findBook(id) {
  return books.find(book => book.id === id);
}

function findBookIndex(id) {
  return books.findIndex(book => book.id === id);
}

/* =============================
   MODAL HANDLER
============================= */
const modal = document.getElementById('bookModal');

function openModal() {
  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
  resetForm();
}

function resetForm() {
  document.getElementById('bookForm').reset();
  document.getElementById('modalTitle').innerText = 'Tambah Buku Baru';
  document.getElementById('bookFormSubmit').innerText = 'Simpan Buku';
  isEditing = false;
  editingBookId = null;
}

/* =============================
   CRUD FUNCTION
============================= */
function addBook() {
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const bookObject = generateBookObject(
    generateId(),
    title,
    author,
    year,
    isComplete
  );

  books.push(bookObject);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
  closeModal();
}

function updateBook() {
  const index = findBookIndex(editingBookId);
  if (index === -1) return;

  books[index] = generateBookObject(
    editingBookId,
    document.getElementById('bookFormTitle').value,
    document.getElementById('bookFormAuthor').value,
    document.getElementById('bookFormYear').value,
    document.getElementById('bookFormIsComplete').checked
  );

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
  closeModal();
}

function deleteBook(id) {
  const index = findBookIndex(id);
  if (index === -1) return;

  books.splice(index, 1);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function toggleBookStatus(id) {
  const book = findBook(id);
  if (!book) return;

  book.isComplete = !book.isComplete;
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function editBook(id) {
  const book = findBook(id);
  if (!book) return;

  document.getElementById('bookFormTitle').value = book.title;
  document.getElementById('bookFormAuthor').value = book.author;
  document.getElementById('bookFormYear').value = book.year;
  document.getElementById('bookFormIsComplete').checked = book.isComplete;

  isEditing = true;
  editingBookId = id;
  document.getElementById('modalTitle').innerText = 'Edit Buku';
  document.getElementById('bookFormSubmit').innerText = 'Simpan Perubahan';

  openModal();
}

/* =============================
   RENDERING
============================= */
function makeBookElement(book) {
  const article = document.createElement('article');
  article.classList.add('book-card');
  article.setAttribute('data-bookid', book.id);
  article.setAttribute('data-testid', 'bookItem');

  const cover = document.createElement('div');
  cover.classList.add('card-cover');

  // --- PERUBAHAN DI SINI ---
  // Kita cek status bukunya:
  // Jika selesai (true) = pakai icon buku tertutup (fa-book)
  // Jika belum (false) = pakai icon buku terbuka (fa-book-open)
  if (book.isComplete) {
    cover.innerHTML = '<i class="fas fa-book"></i>';
  } else {
    cover.innerHTML = '<i class="fas fa-book-open"></i>';
  }
  // -------------------------

  const body = document.createElement('div');
  body.classList.add('card-body');

  // ... (kode di bawahnya tetap sama, tidak perlu diubah) ...

  const title = document.createElement('h3');
  title.innerText = book.title;
  title.setAttribute('data-testid', 'bookItemTitle');

  const author = document.createElement('p');
  author.innerText = book.author;
  author.setAttribute('data-testid', 'bookItemAuthor');

  const year = document.createElement('p');
  year.innerText = book.year;
  year.setAttribute('data-testid', 'bookItemYear');

  body.append(title, author, year);

  const actions = document.createElement('div');
  actions.classList.add('card-actions');

  const toggleBtn = document.createElement('button');
  toggleBtn.classList.add(
    'action-btn',
    book.isComplete ? 'btn-incomplete' : 'btn-complete'
  );
  toggleBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleBtn.innerHTML = book.isComplete
    ? '<i class="fas fa-undo"></i>'
    : '<i class="fas fa-check"></i>';
  toggleBtn.addEventListener('click', () => toggleBookStatus(book.id));

  const editBtn = document.createElement('button');
  editBtn.classList.add('action-btn', 'btn-edit');
  editBtn.setAttribute('data-testid', 'bookItemEditButton');
  editBtn.innerHTML = '<i class="fas fa-edit"></i>';
  editBtn.addEventListener('click', () => editBook(book.id));

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('action-btn', 'btn-delete');
  deleteBtn.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.addEventListener('click', () => {
    if (confirm('Hapus buku ini?')) {
      deleteBook(book.id);
    }
  });

  actions.append(toggleBtn, editBtn, deleteBtn);
  article.append(cover, body, actions);

  return article;
}

function renderBooks(bookList = books) {
  const incomplete = document.getElementById('incompleteBookList');
  const complete = document.getElementById('completeBookList');

  const emptyIncomplete = document.getElementById('emptyIncomplete');
  const emptyComplete = document.getElementById('emptyComplete');

  const incompleteCountSpan = document.getElementById('incompleteBookCount');
  const completeCountSpan = document.getElementById('completeBookCount');

  incomplete.innerHTML = '';
  complete.innerHTML = '';

  let incompleteCount = 0;
  let completeCount = 0;

  for (const book of bookList) {
    const element = makeBookElement(book);
    if (book.isComplete) {
      complete.append(element);
      completeCount++;
    } else {
      incomplete.append(element);
      incompleteCount++;
    }
  }

  // UPDATE COUNTER (Bagian Baru)
  incompleteCountSpan.innerText = `${incompleteCount} buku`;
  completeCountSpan.innerText = `${completeCount} buku`;

  emptyIncomplete.style.display = incompleteCount > 0 ? 'none' : 'flex';
  emptyComplete.style.display = completeCount > 0 ? 'none' : 'flex';
}


/* =============================
   SEARCH
============================= */
function searchBooks(keyword) {
  const filtered = books.filter(book =>
    book.title.toLowerCase().includes(keyword.toLowerCase())
  );
  renderBooks(filtered);
}

/* =============================
   EVENT LISTENER
============================= */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnShowModal').addEventListener('click', openModal);
  document.querySelector('.close-modal').addEventListener('click', closeModal);

  window.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  document.getElementById('bookForm').addEventListener('submit', e => {
    e.preventDefault();
    isEditing ? updateBook() : addBook();
  });

  document.getElementById('searchBook').addEventListener('submit', e => {
    e.preventDefault();
    const keyword = document.getElementById('searchBookTitle').value;
    searchBooks(keyword);
  });

  if (isStorageAvailable()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, () => {
  renderBooks();
});