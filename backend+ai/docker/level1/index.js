import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port =  process.env.PORT || 5000;

app.get("/", (req, res) => {
    return res.status(200).json({message: "Hello, World!"});
});

app.get("/home", (req, res) => {
    return res.status(200).json({message: "Welcome to the Home Page!"});
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
