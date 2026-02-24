import express from "express";

const app = express();


app.post("/webhook", (req:Request, res:Response) => {
  console.log(req.body);
  
});

app.listen(3060, () => {
  console.log("Server is running on port 3000");
});