import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from 'cookie-parser';
// const gameRoutes = require('./gameRoutes');
import gameRoutes from "./routes/gameRoute.js";
import authRoutes from "./routes/authRoute.js";
// import decodeUserCookie from "./decodeUserCookie.js";
const app = express();
dotenv.config();
const PORT=process.env.PORT||8800;
//routes

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Replace with the actual origin of your client application
  credentials: true
}));

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Succesfully connected to database");
  } catch (error) {
    throw error;
  }
};
mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});
mongoose.connection.on("connected", () => {
  console.log("mongoDB connected!");
});

app.use(express.json());

app.use("/api", gameRoutes);
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  connect();
  console.log("Conneted to BACKEND");
});
