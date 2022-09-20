require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const pool = require("./db");

const PORT = process.env.PORT || 8080;

//parse the body of any request coming from html forms
app.use(express.urlencoded({ extended: true }));
//parse the body of any request not coming through an html form
app.use(express.json());
//allow CORS from any origin
app.use(cors());

app.get("/", (req, res) => {
  res.send("Node & SQL Lecture");
});

//CRUD OPERATIONS

//GET all users
app.get("/users", async (req, res) => {
  try {
    // const data = await pool.query("SELECT * FROM users");
    // console.log(data);
    const { rows } = await pool.query("SELECT * FROM users");
    console.log(rows);
    res.json(rows);
  } catch (err) {
    console.log(err);
  }
});

//GET one user by id
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const {
      rows: [user],
      rowCount,
      //Avoid SQL Injection ($parameter): The first parameter maps to the first question mark, and the second parameter maps to the second question mark. This minimal change ensures that the input values are escaped and, as such, prevents a SQL injection attack here.
    } = await pool.query(`SELECT * FROM users WHERE id=$1;`, [id]);

    if (!rowCount) {
      return res.status(404).send(`The user with the id ${id} does not exist`);
    }
    console.log("user by id", user);
    return res.status(200).send(user);
  } catch (err) {
    console.log(err);
  }
});

//POST - create a user
app.post("/users", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send("Please fill in your name, email and password");
  }
  try {
    const {
      rows: [createdUser],
    } = await pool.query(
      "INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *;",
      [name, email, password]
    );
    return res.status(201).send(createdUser);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
});

//PUT - update a user
app.put("/users/:id", async (req, res) => {
  const { id } = req.params;

  const { name, email, password } = req.body;

  //block request if the payload is missing a required field
  if (!name || !email || !password)
    return res
      .status(400)
      .send("Please provide values for name, email, password");

  try {
    const {
      rowCount,
      rows: [updatedUser],
    } = await pool.query(
      "UPDATE users SET name=$1,email=$2,password=$3 WHERE id=$4 RETURNING *",
      [name, email, password, id]
    );

    // inform the user if they try to update a user that does not exist
    if (!rowCount)
      return res
        .status(404)
        .send(
          `The user with id ${id} that you are trying to update does not exist`
        );

    return res.status(201).send(updatedUser);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
});

//DELETE a user based on id
app.delete("/users/:id", async (req, res) => {
  //id is important to delete a user because if you don't provide the id you will delete all the users
  const { id } = req.params;

  try {
    const {
      rows: [deletedUser],
      rowCount,
    } = await pool.query("DELETE FROM users WHERE id=$1 RETURNING *", [id]);

    // inform the user if they try to delete a user that does not exist
    if (!rowCount)
      return res
        .status(404)
        .send(
          `The user with id ${id} that you are trying to delete does not exist`
        );

    return res
      .status(200)
      .send(`The user "${deletedUser.name}" has been deleted`);
  } catch (err) {
    console.log(err);
    return res.status(500).send("Something went wrong");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
