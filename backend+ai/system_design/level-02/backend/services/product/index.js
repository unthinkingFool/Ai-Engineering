import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;



app.use(express.json());


/** apis */
app.get("/", (req, res) => {
  res.status(200).json({message : "Hello World! from product service"});
});

/** start our server */

app.listen(port, () => {
  console.log(`Server started FROM PRODUCT SERVICE at port: ${port}`);
});

