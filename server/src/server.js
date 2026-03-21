import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3005

// CORS configuration
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}))

app.all('/api/auth/{*any}', toNodeHandler(auth));
app.use(express.json());

// Using queries for redirecting
app.get("/device", async (req, res) => {
    const { user_code } = req.query
    res.redirect(`http://localhost:3000/device?user_code=${user_code}`)
})
app.get("/health", (req, res) => {
    res.send("Server Health OK")
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})

