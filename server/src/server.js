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

app.all("/api/auth/*splat", toNodeHandler(auth))
app.use(express.json());

app.get("/health", (req, res) => {
    res.send("Server Health OK")
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})

