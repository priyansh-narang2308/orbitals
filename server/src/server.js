import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3005

app.get("/health", (req, res) => {
    res.send("Server Health OK")
})

app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`)
})

