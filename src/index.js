const fs = require("fs");
const { bookmarkFileName } = require("./config.js");
const Bookmark = require("./Bookmark");
const HTMLParser = require("node-html-parser");

function readBookmarks(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(bookmarkFileName, "utf-8", (err, data) => {
      if (err) {
        reject(`Cannot open file ${bookmarkFileName}`);
      } else {
        resolve({data});    
      }
    });
  });
}

function convertDate(dateString) {
  // chrome stores the number of seconds, we need number of miliseconds
  // 1 second = 1000ms so just multiply number of seconds by 1000
  const d = parseInt(dateString);
  return d * 1000;
}

function sortBookmarks(bookMarks, asc = true) {
  // use selection sort to sort the bookmarks in ascending order
  if(asc) {    
    let curSmallest;

    for(let i = 0; i < bookMarks.length; i++) {
      curSmallest = i;
      for(let j = i; j < bookMarks.length; j++) {
        if(bookMarks[j].dateAdded < bookMarks[curSmallest].dateAdded) {
          curSmallest = j;
        }
      }
      let temp = bookMarks[i];
      bookMarks[i] = bookMarks[curSmallest];
      bookMarks[curSmallest] = temp;
    }
    return bookMarks;
  } else {
    return bookMarks;
  }
}


(async () => {
  let bookmarkData;
  
  // read in the bookmark data - it will be in an object of the form {data: "big html string"}
  try {
    bookmarkData = await readBookmarks(bookmarkFileName);
  }catch(e) {
    console.log(e);
    return;
  }

  const root = HTMLParser.parse(bookmarkData.data);

  // grab all the <a> tags since they are the bookmarks
  const aTags = root.querySelectorAll("a");  

  // create all the bookmark objects
  const bookMarks = [];
  aTags.forEach(a => {
    const date = convertDate(a.getAttribute("ADD_DATE"));
    bookMarks.push(new Bookmark(a.innerText, a.getAttribute("href"), date));
  });

  sortBookmarks(bookMarks);
  bookMarks.forEach(bookmark => console.log(new Date(bookmark.dateAdded).getFullYear())); 
})();