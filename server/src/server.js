import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import prisma from "./lib/db.js";

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


app.get("/api/conversations", async (req, res) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const conversations = await prisma.conversation.findMany({
            where: { userId: session.user.id },
            orderBy: { updatedAt: "desc" },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" }
                }
            }
        });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

app.get("/api/me", async (req, res) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            return res.status(401).json({ error: "No active session" });
        }

        return res.json(session);
    } catch (error) {
        console.error("Session error:", error);
        return res.status(500).json({ error: "Failed to get session", details: error.message });
    }
});


// Delete Conversation Endpoint
app.delete("/api/conversations/:id", async (req, res) => {
    try {
        const session = await auth.api.getSession({
            headers: req.headers,
        });

        if (!session?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const conversationId = req.params.id;

        await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userId: session.user.id
            }
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete conversation" });
    }
});

// Using queries for redirecting
app.get("/device", async (req, res) => {
    const { user_code } = req.query
    res.redirect(`${process.env.FRONTEND_URL}/device?user_code=${user_code}`)
})
app.get("/health", (req, res) => {
    res.send("Server Health OK")
})

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log(`Server is running on port: ${PORT}`)
    });
}

export default app;

