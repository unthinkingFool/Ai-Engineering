import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());


/** apis */
app.get("/", (req, res) => {
  res.status(200).json({message : `Hello World! from ${process.env.SERVER_NAME} service`});
});

/** microservices */
app.use("/auth", proxy("http://auth-service:7001"));
app.use("/order", proxy("http://order-service:7002"));
app.use("/product", proxy("http://product-service:7003"));


/** start our server */
app.listen(port, () => {
  console.log(`Server started FROM api gateway SERVICE at port: ${port}`);
});

