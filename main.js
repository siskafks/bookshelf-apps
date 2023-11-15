document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    const search = document.getElementById('searchBook');
    search.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBooksByTitle();
    });
});

const books = [];
const RENDER_EVENT = 'render-book';

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;
    const isComplete = document.getElementById('inputBookIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
      id,
      title,
      author,
      year:Number(year),
      isCompleted
    }
}

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;
 
    const textAuthor = document.createElement('p');
    textAuthor.innerText = bookObject.author;

    const textYear = document.createElement('p');
    textYear.innerText = bookObject.year;

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textTitle, textAuthor, textYear);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    if (bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.innerText = 'Mark as Unfinished';
        undoButton.classList.add('green');
     
        undoButton.addEventListener('click', function () {
          undoBookFromCompleted(bookObject.id);
        });
     
        const trashButton = document.createElement('button');
        trashButton.innerText = 'Delete';
        trashButton.classList.add('red');
     
        trashButton.addEventListener('click', function () {
          removeBookFromCompleted(bookObject.id);
        });
     
        buttonContainer.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.innerText = 'Mark as Finished';
        checkButton.classList.add('green');
        
        checkButton.addEventListener('click', function () {
          addBookToCompleted(bookObject.id);
        });
        
        const trashButton = document.createElement('button');
        trashButton.innerText = 'Delete';
        trashButton.classList.add('red');
     
        trashButton.addEventListener('click', function () {
          removeBookFromCompleted(bookObject.id);
        });

        buttonContainer.append(checkButton, trashButton);
    }

    container.append(buttonContainer);

    return container;
}

function addBookToCompleted (bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id === bookId) {
        return bookItem;
      }
    }
    return null;
}

function removeBookFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);
   
    if (bookTarget === -1) return;
   
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
   
   
function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);
   
    if (bookTarget == null) return;
   
    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id === bookId) {
        return index;
      }
    }
   
    return -1;
}

function searchBooksByTitle(){
    const input = document.getElementById('searchBookTitle').value.toLowerCase();
    const bookList = document.querySelectorAll('.book_item');

    bookList.forEach(bookItem => {
        const titleElement = bookItem.querySelector('h3');
        const result = titleElement.textContent.toLowerCase();
        if (result.indexOf(input) != -1){
            bookItem.setAttribute("style", "display: block;");
        } else {
            bookItem.setAttribute("style", "display: none;");
        }
    });
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
    incompleteBookshelfList.innerHTML = '';

    const completedBookshelfList = document.getElementById('completeBookshelfList');
    completedBookshelfList.innerHTML = '';
 
    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) 
            incompleteBookshelfList.append(bookElement);
        else
            completedBookshelfList.append(bookElement);
    }
});

function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';
 
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
}