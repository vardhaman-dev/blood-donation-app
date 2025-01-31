require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const path = require("path");
const oracledb = require("oracledb");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from the 'public' folder

// Configure Oracle connection details using environment variables
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
};

// Handle POST request for blood donation
app.post("/donate-blood", async (req, res) => {
  const { name, bloodType, pincode, contact } = req.body;

  try {
    // Establish Oracle database connection
    const connection = await oracledb.getConnection(dbConfig);

    // Insert donor data into DONAR table and get the donor ID (Did)
    const insertDonorSql = ```javascript
            INSERT INTO DONAR (NAME, PINCODE, PHONE)
            VALUES (:name, :pincode, :contact)
            RETURNING Did INTO :Did
        `;

    let donorResult = await connection.execute(
      insertDonorSql,
      {
        name,
        pincode,
        contact,
        Did: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      },
      { autoCommit: true },
    );

    const donorId = donorResult.outBinds.Did[0];

    // Determine the blood type and insert into the corresponding table
    let insertBloodTypeSql = "";
    switch (bloodType) {
      case "A+":
        insertBloodTypeSql = "INSERT INTO BLD_AP (Did) VALUES (:donorId)";
        break;
      case "A-":
        insertBloodTypeSql = "INSERT INTO BLD_AN (Did) VALUES (:donorId)";
        break;
      case "B+":
        insertBloodTypeSql = "INSERT INTO BLD_BP (Did) VALUES (:donorId)";
        break;
      case "B-":
        insertBloodTypeSql = "INSERT INTO BLD_BN (Did) VALUES (:donorId)";
        break;
      case "O+":
        insertBloodTypeSql = "INSERT INTO BLD_OP (Did) VALUES (:donorId)";
        break;
      case "O-":
        insertBloodTypeSql = "INSERT INTO BLD_ON (Did) VALUES (:donorId)";
        break;
      case "AB+":
        insertBloodTypeSql = "INSERT INTO BLD_ABP (Did) VALUES (:donorId)";
        break;
      case "AB-":
        insertBloodTypeSql = "INSERT INTO BLD_ABN (Did) VALUES (:donorId)";
        break;
      default:
        throw new Error("Invalid blood type");
    }

    // Insert into the corresponding blood type table
    await connection.execute(
      insertBloodTypeSql,
      { donorId },
      { autoCommit: true },
    );

    // Close the connection
    await connection.close();

    // Send response back to client
    res.send("Donation form received and stored in the database!");
  } catch (err) {
    console.error("Error inserting data into Oracle:", err);
    res.status(500).send("Error storing donor data in the database.");
  }
});

// Get donors by blood type
app.get("/donors/:bloodType", async (req, res) => {
  const bloodType = req.params.bloodType;
  let selectDonorsSql = "";

  try {
    // Establish Oracle database connection
    const connection = await oracledb.getConnection(dbConfig);

    // Determine the blood type table to query
    switch (bloodType) {
      case "A+":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_AP B ON D.Did = B.Did`;
        break;
      case "A-":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_AN B ON D.Did = B.Did`;
        break;
      case "B+":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_BP B ON D.Did = B.Did`;
        break;
      case "B-":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_BN B ON D.Did = B.Did`;
        break;
      case "O+":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_OP B ON D.Did = B.Did`;
        break;
      case "O-":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_ON B ON D.Did = B.Did`;
        break;
      case "AB+":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_ABP B ON D.Did = B.Did`;
        break;
      case "AB-":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_ABN B ON D.Did = B.Did`;
        break;
      default:
        throw new Error("Invalid blood type");
    }

    // Execute the query and fetch results
    const result = await connection.execute(selectDonorsSql);
    const donors = result.rows;

    // Close the connection
    await connection.close();

    // Send the result back to the client
    res.json({ donors });
  } catch (err) {
    console.error("Error fetching data from Oracle:", err);
    res.status(500).send("Error retrieving donor data.");
  }
});

// Search donors by blood group and pincode
app.post("/search-donors", async (req, res) => {
  const { bloodGroup, pincode } = req.body;
  let selectDonorsSql = "";

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // Use the correct table based on the blood group
    switch (bloodGroup) {
      case "A+":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_AP B ON D.Did = B.Did
                                   WHERE D.PINCODE = :pincode`;
        break;
      case "A-":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_AN B ON D.Did = B.Did
                                   WHERE D.PINCODE = :pincode`;
        break;
      case "B+":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_BP B ON D.Did = B.Did
                                   WHERE D.PINCODE = :pincode`;
        break;
      case "B-":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_BN B ON D.Did = B.Did
                                   WHERE D.PINCODE = :pincode`;
        break;
      case "O+":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_OP B ON D.Did = B.Did
                                   WHERE D.PINCODE = :pincode`;
        break;
      case "O-":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_ON B ON D.Did = B.Did
                                   WHERE D.PINCODE = :pincode`;
        break;
      case "AB+":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_ABP B ON D.Did = B.Did
                                   WHERE D.PINCODE = :pincode`;
        break;
      case "AB-":
        selectDonorsSql = `SELECT D.NAME, D.PINCODE, D.PHONE
                                   FROM DONAR D
                                   JOIN BLD_ABN B ON D.Did = B.Did
                                   WHERE D.PINCODE = :pincode`;
        break;
      default:
        throw new Error("Invalid blood group");
    }

    // Execute the query
    const result = await connection.execute(selectDonorsSql, [pincode]);

    // Close the connection
    await connection.close();

    // Send the result to the frontend
    res.json({
      donors: result.rows.map((row) => ({
        name: row[0],
        pincode: row[1],
        phone: row[2],
      })),
    });
  } catch (err) {
    console.error("Error fetching donor data:", err);
    res.status(500).send("Error retrieving donor data.");
  }
});

// Signup route
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const insertSql = `INSERT INTO LOGIN (USERNAME, PASSWORD) VALUES (:username, :password)`;
    const connection = await oracledb.getConnection(dbConfig);

    await connection.execute(insertSql, [username, hashedPassword]);
    await connection.commit();
    await connection.close();

    res.status(201).send("User  created successfully");
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).send("Error creating user");
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);
    const selectSql = `SELECT PASSWORD FROM LOGIN WHERE USERNAME = :username`;
    const result = await connection.execute(selectSql, [username]);

    if (result.rows.length === 0) {
      return res.status(401).send("User  not found");
    }

    const isMatch = await bcrypt.compare(password, result.rows[0][0]);
    if (!isMatch) {
      return res.status(401).send("Invalid password");
    }

    // Generate a token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    await connection.close();

    res.json({ token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Error logging in");
  }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
  const token =
    req.headers["authorization"] && req.headers["authorization"].split(" ")[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user; // Attach user info to request
    next(); // Proceed to the next middleware or route handler
  });
}

// Get all donors
app.get("/donors", async (req, res) => {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute("SELECT * FROM DONAR");
    await connection.close();

    res.json(
      result.rows.map((row) => ({
        id: row[0],
        name: row[1],
        pincode: row[2],
        phone: row[3],
      })),
    );
  } catch (err) {
    console.error("Error fetching donors:", err);
    res.status(500).send("Error retrieving donors.");
  }
});

// Delete donor by phone number
app.delete("/donors/:phone", async (req, res) => {
  const phone = req.params.phone;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // First, get the Did associated with the phone number
    const getDidQuery = `SELECT Did FROM DONAR WHERE PHONE = :1`;
    const didResult = await connection.execute(getDidQuery, [phone]);

    if (didResult.rows.length === 0) {
      await connection.close();
      return res.status(404).send("Donor not found");
    }

    const did = didResult.rows[0][0];

    // Delete from all blood type tables
    const bloodTables = [
      "BLD_AP",
      "BLD_AN",
      "BLD_BP",
      "BLD_BN",
      "BLD_ABP",
      "BLD_ABN",
      "BLD_OP",
      "BLD_ON",
    ];

    for (const table of bloodTables) {
      const deleteBloodQuery = `DELETE FROM ${table} WHERE Did = :1`;
      await connection.execute(deleteBloodQuery, [did], { autoCommit: false });
    }

    // Finally, delete from DONAR table
    const deleteDonarQuery = `DELETE FROM DONAR WHERE PHONE = :1`;
    await connection.execute(deleteDonarQuery, [phone], { autoCommit: true });

    await connection.close();
    res.json({ message: "Donor deleted successfully" });
  } catch (err) {
    console.error("Error deleting donor:", err);
    res.status(500).send("Error deleting donor");
  }
});

// Update donor by phone number
app.put("/donors/:phone", async (req, res) => {
  const phone = req.params.phone;
  const { name, bloodType, pincode } = req.body;

  try {
    const connection = await oracledb.getConnection(dbConfig);

    // First, get the Did associated with the phone number
    const getDidQuery = `SELECT Did FROM DONAR WHERE PHONE = :1`;
    const didResult = await connection.execute(getDidQuery, [phone]);

    if (didResult.rows.length === 0) {
      await connection.close();
      return res.status(404).send("Donor not found");
    }

    const did = didResult.rows[0][0];

    // Update DONAR table
    const updateDonarQuery = `UPDATE DONAR SET NAME = :1, PINCODE = :2 WHERE PHONE = :3`;
    await connection.execute(updateDonarQuery, [name, pincode, phone], {
      autoCommit: false,
    });

    // Delete from all blood type tables
    const bloodTables = [
      "BLD_AP",
      "BLD_AN",
      "BLD_BP",
      "BLD_BN",
      "BLD_ABP",
      "BLD_ABN",
      "BLD_OP",
      "BLD_ON",
    ];

    for (const table of bloodTables) {
      const deleteBloodQuery = `DELETE FROM ${table} WHERE Did = :1`;
      await connection.execute(deleteBloodQuery, [did], { autoCommit: false });
    }

    // Insert into new blood type table
    let insertTable;
    switch (bloodType) {
      case "A+":
        insertTable = "BLD_AP";
        break;
      case "A-":
        insertTable = "BLD_AN";
        break;
      case "B+":
        insertTable = "BLD_BP";
        break;
      case "B-":
        insertTable = "BLD_BN";
        break;
      case "AB+":
        insertTable = "BLD_ABP";
        break;
      case "AB-":
        insertTable = "BLD_ABN";
        break;
      case "O+":
        insertTable = "BLD_OP";
        break;
      case "O-":
        insertTable = "BLD_ON";
        break;
      default:
        throw new Error("Invalid blood type");
    }

    const insertBloodQuery = `INSERT INTO ${insertTable} (Did) VALUES (:1)`;
    await connection.execute(insertBloodQuery, [did], { autoCommit: true });

    await connection.close();
    res.json({ message: "Donor updated successfully" });
  } catch (err) {
    console.error("Error updating donor:", err);
    res.status(500).send("Error updating donor");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
