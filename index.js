const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { pool } = require("./config");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();
require("dotenv").config();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

async function checkUser(phone, password) {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE phone = $1 limit 1",
    [phone]
  );
  if (rows.length > 0) {
    const user = rows[0];

    if (await bcrypt.compare(password, user.password)) {
      return true;
    }
  }
  return false;
}

const authenticateUser = async (request, response) => {
  const { phone, password } = request.body;

  await pool.query(
    "SELECT * FROM users WHERE phone = $1 limit 1",
    [phone],
    (error, results) => {
      if (error) throw error;
      if (results.rows.length > 0) {
        if (checkUser(phone, password)) {
          // authentication failed;
          response.status(401).json({
            status: "error",
            message: "Email or password is incorrect",
          });
        } else {
          // authentication successful
          const token = jwt.sign({ sub: results.rows[0] }, process.env.secret, {
            expiresIn: "365d",
          });
          response.status(200).json({
            data: {
              firstname: results.rows[0].firstname,
              lastname: results.rows[0].lastname,
              email: results.rows[0].email,
              phone: results.rows[0].phone,
              token: token,
            },
          });
        }
      } else {
        response.status(401).json({
          status: "error",
          message: "Email or password is incorrect",
        });
      }
    }
  );
};

const getUsers = (request, response) => {
  pool.query("SELECT * FROM users", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const register = async (request, response) => {
  const { firstname, lastname, email, phone, password } = request.body;

  // check if user exists using email or phone number
  await pool.query(
    "SELECT * FROM users WHERE phone = $1 OR email = $2",
    [phone, email],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows.length > 0) {
        response.status(409).json({
          status: "error",
          message: "Email or phone already exists",
        });
      } else {
        // hash password
        let hashedPassword = bcrypt.hashSync(password, 10);

        // insert user into databas

        pool.query(
          "INSERT INTO users (firstname, lastname, email, phone, password) VALUES ($1, $2, $3, $4, $5)",
          [firstname, lastname, email, phone, password],
          (error) => {
            if (error) {
              throw error;
            }
            response.status(201).json({
              status: "success",
              message: "Your Registration is successful.",
            });
          }
        );
      }
    }
  );
};
const Welcome = async (request, response) => {
  response.status(201).json({
    status: "ok",
    message: "Hi the API is working",
  });
};
app.route("/api/").get(Welcome);

app.route("/api/authenticate").post(authenticateUser);

app.route("/api/register").post(register);

// Start server
app.listen(process.env.PORT || 8080, () => {
  console.log(`Server listening`);
});
