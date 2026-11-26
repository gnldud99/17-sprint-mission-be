require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const productRouter = require("./productRouter.js");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("서버 연결 성공");
});

app.use("/products", productRouter);

app.use((req, res) => {
  res.status(404).json({ message: "요청한 주소를 찾을 수 없습니다." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.type === "entity.parse.failed") {
    return res
      .status(400)
      .json({ message: "요청 데이터 형식이 올바르지 않습니다." });
  }

  if (error.status === 413) {
    return res.status(413).json({ message: "요청 데이터가 너무 큽니다." });
  }

  console.error(error);
  res.status(500).json({ message: "서버에서 오류가 발생했습니다." });
});

async function startServer() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB 연결 성공");

  app.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error("서버 시작 실패:", error.message);
  process.exitCode = 1;
});
