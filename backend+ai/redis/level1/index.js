import express from "express";
import pool from "./lib/db.js";
import Redis from "ioredis";
import ratelimitter from "./middleware/ratelimiting.js"
import sendEmail from "./lib/sendEmail.js"
import emailQueue from "./queue.js"

const app = express();
const port = process.env.PORT || 3000;
export const redis= new Redis(process.env.REDIS_URL)


app.use(express.json());


/** apis */
app.post("/create", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    

    const result = await pool.query(
      `INSERT INTO users(name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, password]
    );

    await emailQueue.add("sendEmail",{email});

    await redis.del("user:all")

    res.status(201).json({
      message: "Successfully created user",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating user" });
  }
});

app.get("/users",ratelimitter, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.get("/users-redis", async (req, res) => {
  try {
    const cachedData = await redis.get("user:all");

    if (cachedData) {
      console.log("Serving from Redis");
      return res.json(JSON.parse(cachedData));
    }

    console.log("Serving from PostgreSQL");

    const result = await pool.query("SELECT * FROM users");

    await redis.set("user:all", JSON.stringify(result.rows));

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching users",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT * FROM users
       WHERE email = $1 AND password = $2`,
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      message: "User found",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching user",
    });
  }
});

app.delete("/delete-user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error deleting user",
    });
  }
});

app.get("/get-user/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const result = await pool.query(
      `SELECT * FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching user",
    });
  }
});

app.post("/send-otp" , async (req,res)=>{
  const {email}=req.body;
  const otp=Math.floor(100000+Math.random()*900000).toString()
  await redis.set(`otp:${email}`, otp ,"EX",30)

  return res.status(200).json({
    message: " otp generated",
    otp
  })
})

app.post("/verify-otp" , async (req,res)=>{
  const {email,otp}=req.body;

  const Catchedotp=await redis.get(`otp:${email}`)

  if(!Catchedotp){
    return res.status(400).json({
      message:"opt invalid"
    })
  }

  if(Catchedotp!=otp){
    return res.status(400).json({
      message:"incorrect otp"
    })
  }

  await radis.del(`otp:${email}`)

  return res.status(200).json({
    message: " successfully verified otp"
  })
})


/** start our server */

app.listen(port, () => {
  console.log(`Server started at port: ${port}`);
});

// get --> without redis : 83 ms
// with redis : 10 ms



//without queue : 13.8 s
// with queue : 380 ms