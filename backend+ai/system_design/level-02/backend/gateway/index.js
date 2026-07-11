import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());


/** apis */
app.get("/", (req, res) => {
  res.status(200).json({message : "Hello World! from gateway"});
});

/** microservices */
app.use("/auth", proxy("http://localhost:7001"));
app.use("/order", proxy("http://localhost:7002"));
app.use("/product", proxy("http://localhost:7003"));


/** start our server */
app.listen(port, () => {
  console.log(`Server started FROM api gateway SERVICE at port: ${port}`);
});

