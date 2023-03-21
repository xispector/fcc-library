/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const schema = new mongoose.Schema({
  title: String,
  comments: [String],
  commentcount: Number,
});

const library = mongoose.model("library", schema);
library.deleteMany({}).then((mes) => console.log(mes));

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async function (req, res) {
      const arr = await library.find({});
      res.json(arr);
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })

    .post(async function (req, res, next) {
      let title = req.body.title;
      if (!title) {
        res.send("missing required field title");
      } else {
        const book = await library.findOne({ title: title });
        if (!book) {
          const newBook = new library({
            title: title,
            comments: [],
            commentcount: 0,
          });
          const newObject = await newBook.save();
          res.json(newObject);
        } else {
          res.json(book);
        }
      }
      //response will contain new book object including atleast _id and title
    })

    .delete(async function (req, res) {
      const deletedBooks = await library.deleteMany({});
      if (deletedBooks.deletedCount > 0) {
        res.send("complete delete successful");
      } else {
        res.send("Something went wrong when books are deleted");
      }
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      library.findById(bookid).then((book) => {
        if (!book) {
          res.send("no book exists");
        } else {
          res.json(book);
        }
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(async function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      const book = await library.findById(bookid);
      if (!comment) {
        res.send("missing required field comment");
      } else if (!book) {
        res.send("no book exists");
      } else {
        book.comments.push(comment);
        book.commentcount++;
        const updatedBook = await book.save();
        res.json(updatedBook);
      }
      //json res format same as .get
    })

    .delete(async function (req, res, next) {
      let bookid = req.params.id;
      const book = await library.findById(bookid);
      if (!book) {
        res.send("no book exists");
      } else {
        const removedBook = await library.deleteOne(book);
        if (removedBook.deletedCount > 0) {
          res.send("delete successful");
        }
      }
      //if successful response will be 'delete successful'
    });
};
