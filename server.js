require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const port = process.env.PORT || 3000;

// Supabase configuration
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// Middleware
// server.js
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Local development
      "https://majestic-strudel-51865f.netlify.app",
    ],
    credentials: true,
  }),
);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper function to convert blood type to table name
const getBloodTable = (bloodType) => {
  return `bld_${bloodType.replace("+", "p").replace("-", "n").toLowerCase()}`;
};

// Donate Blood Endpoint
app.post("/donate-blood", async (req, res) => {
  const { name, bloodType, pincode, contact } = req.body;

  try {
    // Insert donor
    // In server.js donate-blood endpoint

    const { data: donor, error: donorError } = await supabase
      .from("donar")
      .insert([{ name, pincode, phone: contact }])
      .select("id");
    // Remove .single()

    if (donorError) throw donorError;

    // Insert blood type
    const { error: bloodError } = await supabase
      .from(getBloodTable(bloodType))
      .insert([{ did: donor.id }]);

    if (bloodError) throw bloodError;

    res.send("Donation form received and stored in the database!");
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).send("Error storing donor data.");
  }
});

// Get Donors by Blood Type
app.get("/donors/:bloodType", async (req, res) => {
  const bloodType = req.params.bloodType;

  try {
    // Get donors from blood type table
    const { data: bloodDonors, error: bloodError } = await supabase
      .from(getBloodTable(bloodType))
      .select("did");

    if (bloodError) throw bloodError;

    const donorIds = bloodDonors.map((b) => b.did);

    // Get donor details
    const { data: donors, error: donorError } = await supabase
      .from("donar")
      .select("name, pincode, phone")
      .in("id", donorIds);

    if (donorError) throw donorError;

    res.json({ donors });
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).send("Error retrieving donor data.");
  }
});

// Search Donors
app.post("/search-donors", async (req, res) => {
  const { bloodGroup, pincode } = req.body;

  try {
    // Get blood type donors
    const { data: bloodDonors, error: bloodError } = await supabase
      .from(getBloodTable(bloodGroup))
      .select("did");

    if (bloodError) throw bloodError;

    const donorIds = bloodDonors.map((b) => b.did);

    // Get matching donors
    const { data: donors, error: donorError } = await supabase
      .from("donar")
      .select("name, pincode, phone")
      .in("id", donorIds)
      .eq("pincode", pincode);

    if (donorError) throw donorError;

    res.json({ donors });
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).send("Error retrieving donor data.");
  }
});

// Authentication Endpoints
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { error } = await supabase
      .from("login")
      .insert([{ username, password: hashedPassword }]);

    if (error) throw error;
    res.status(201).send("User created successfully");
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).send("Error creating user");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("login")
      .select("password")
      .eq("username", username)
      .single();

    if (error || !user) return res.status(401).send("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).send("Invalid password");

    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).send("Error logging in");
  }
});

// Donor Management Endpoints
app.get("/donors", async (req, res) => {
  try {
    const { data: donors, error } = await supabase.from("donar").select("*");

    if (error) throw error;
    res.json(donors);
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).send("Error retrieving donors.");
  }
});

app.delete("/donors/:phone", async (req, res) => {
  const phone = req.params.phone;

  try {
    // Get donor
    const { data: donor, error: donorError } = await supabase
      .from("donar")
      .select("id")
      .eq("phone", phone)
      .single();

    if (!donor) return res.status(404).send("Donor not found");

    // Delete from all blood tables
    const bloodTables = [
      "bld_ap",
      "bld_an",
      "bld_bp",
      "bld_bn",
      "bld_abp",
      "bld_abn",
      "bld_op",
      "bld_on",
    ];

    for (const table of bloodTables) {
      await supabase.from(table).delete().eq("did", donor.id);
    }

    // Delete donor
    await supabase.from("donar").delete().eq("phone", phone);

    res.json({ message: "Donor deleted successfully" });
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).send("Error deleting donor");
  }
});

app.put("/donors/:phone", async (req, res) => {
  const phone = req.params.phone;
  const { name, bloodType, pincode } = req.body;

  try {
    // Get donor
    const { data: donor, error: donorError } = await supabase
      .from("donar")
      .select("id")
      .eq("phone", phone)
      .single();

    if (!donor) return res.status(404).send("Donor not found");

    // Update donor
    await supabase.from("donar").update({ name, pincode }).eq("phone", phone);

    // Delete from all blood tables
    const bloodTables = [
      "bld_ap",
      "bld_an",
      "bld_bp",
      "bld_bn",
      "bld_abp",
      "bld_abn",
      "bld_op",
      "bld_on",
    ];

    for (const table of bloodTables) {
      await supabase.from(table).delete().eq("did", donor.id);
    }

    // Insert new blood type
    await supabase.from(getBloodTable(bloodType)).insert([{ did: donor.id }]);

    res.json({ message: "Donor updated successfully" });
  } catch (err) {
    console.error("Supabase error:", err);
    res.status(500).send("Error updating donor");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
