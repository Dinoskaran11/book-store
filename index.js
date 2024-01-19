import express from "express";
import mysql from "mysql";
import cors from "cors";
import fileUpload from "express-fileupload";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static('uploads'));


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "book_store",
});

app.get("/", (req, res) => {
  res.json("hello");
});

app.get("/books", (req, res) => {
  const q = "SELECT * FROM books";
  db.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    return res.json(data);
  });
});

app.post("/books", (req, res) => {
  const { title, description, price } = req.body;
  const cover = req.files ? req.files.cover : null;

  if (!title || !description || !price || !cover) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const coverPath = path.join(__dirname, "uploads", cover.name);

  cover.mv(coverPath, (err) => {
    if (err) {
      return res.status(500).json({ message: "Error uploading file", error: err });
    }

    const q =
      "INSERT INTO books(`title`, `description`, `cover`, `price`) VALUES (?, ?, ?, ?)";

    const values = [title, description, cover.name, price];

    db.query(q, values, (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Database error", error: err });
      }

      return res.json({ message: "Book added successfully", data });
    });
  });
});

app.delete("/books/:id", (req, res) => {
  const bookId = req.params.id;
  const q = "DELETE FROM books WHERE id = ?";

  db.query(q, [bookId], (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
});

app.put("/books/:id", (req, res) => {
  const bookId = req.params.id;
  const { title, description, price } = req.body;
  const cover = req.files ? req.files.cover : null;

  const q =
    "UPDATE books SET `title`= ?, `description`= ?, `price`= ?, `cover`= ? WHERE id = ?";

  const values = [title, description, price, cover ? cover.name : null, bookId];

  db.query(q, values, (err, data) => {
    if (err) return res.send(err);
    return res.json(data);
  });
});

app.listen(8800, () => {
  console.log("Connected to backend.");
});
