"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { ArrowLeft, MessageSquare, Bot, User, Clock, Trash2, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Loader } from "@/components/ui/loader"
import { motion, AnimatePresence } from "motion/react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Message {
    id: string;
    role: string;
    content: string;
    createdAt: string;
}

interface Conversation {
    id: string;
    title: string | null;
    mode: string;
    createdAt: string;
    updatedAt: string;
    messages: Message[];
}

export default function HistoryPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [isAlertOpen, setIsAlertOpen] = useState<string | null>(null)
    const { data: session, isPending } = authClient.useSession()
    const router = useRouter()

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/sign-in")
            return
        }

        const fetchHistory = async () => {
            try {
                const response = await fetch("http://localhost:3005/api/conversations", {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include"
                })

                if (response.ok) {
                    const data = await response.json()
                    setConversations(data)
                }
            } catch (error) {
                console.error("Failed to fetch conversations history:", error)
            } finally {
                setIsLoading(false)
            }
        }

        if (session) {
            fetchHistory()
        }
    }, [session, isPending, router])

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e?.stopPropagation();
        setDeletingId(id);
        try {
            const response = await fetch(`http://localhost:3005/api/conversations/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (response.ok) {
                setConversations(conversations.filter(c => c.id !== id));
                if (selectedConversation?.id === id) {
                    setSelectedConversation(null);
                }
                toast.error("Conversation deleted successfully");
            } else {
                toast.error("Failed to delete conversation");
            }
        } catch (error) {
            console.error("Failed to delete conversation:", error);
            toast.error("An error occurred while deleting");
        } finally {
            setDeletingId(null);
        }
    }

    if (isPending || isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
                <Loader />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Scanning past orbits...</p>
            </div>
        )
    }

    return (
        <div className="relative flex flex-col items-center min-h-screen w-full px-4 overflow-hidden bg-background">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-4xl mt-6 mb-20 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/")}
                        className="cursor-pointer text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-lg font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Orbital Sessions
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-[650px]">
                    <div className="md:col-span-5 h-full">
                        <Card className="h-full border-border/40 bg-card/40 backdrop-blur-xl shadow-xl ring-1 ring-white/5 flex flex-col mt-4 pt-0">
                            <CardHeader className="p-3 border-b border-border/10">
                                <CardTitle className="text-sm font-semibold">Previous Logs</CardTitle>
                            </CardHeader>
                            <CardContent className="p-1 flex-1 overflow-hidden">
                                <div className="h-[580px] overflow-y-auto pr-2 space-y-1.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                    {conversations.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground text-sm">
                                            No logs found.
                                        </div>
                                    ) : (
                                        conversations.map((chat) => (
                                            <div
                                                key={chat.id}
                                                onClick={() => setSelectedConversation(chat)}
                                                className={`p-2.5 rounded-lg cursor-pointer transition-all duration-150 border flex flex-col gap-1 relative group
                                                    ${selectedConversation?.id === chat.id 
                                                        ? 'bg-primary/10 border-primary/20 ring-1 ring-primary/10' 
                                                        : 'border-transparent hover:bg-muted/40'}`}
                                            >
                                                <div className="flex items-center justify-between pr-7">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${selectedConversation?.id === chat.id ? 'text-primary' : 'text-muted-foreground'}`} />
                                                        <span className="font-medium text-[13px] truncate">
                                                            {chat.title || "Untitled log"}
                                                        </span>
                                                    </div>

                                                    <AlertDialog open={isAlertOpen === chat.id} onOpenChange={(open) => setIsAlertOpen(open ? chat.id : null)}>
                                                        <AlertDialogTrigger asChild>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setIsAlertOpen(chat.id); }}
                                                                className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 hover:text-destructive text-muted-foreground/60 p-1 rounded-md hover:bg-destructive/10 transition-all duration-150 cursor-pointer"
                                                                title="Delete conversation"
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-card/90 backdrop-blur-xl border-border/40 shadow-2xl">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete this conversation and all its messages. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel onClick={(e) => { e.stopPropagation(); setIsAlertOpen(null); }}>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    disabled={deletingId === chat.id}
                                                                    onClick={async (e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        await handleDelete(chat.id, e);
                                                                        setIsAlertOpen(null);
                                                                    }}
                                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer flex items-center gap-1.5"
                                                                >
                                                                    {deletingId === chat.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                                                                    {deletingId === chat.id ? "Deleting..." : "Delete"}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>

                                                <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                                                    <span className="capitalize px-1.5 py-0 rounded bg-muted/80 text-foreground/70 font-semibold">
                                                        {chat.mode}
                                                    </span>
                                                    <div className="flex items-center gap-1 opacity-70">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(chat.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-7 h-full mt-4">
                        <AnimatePresence mode="wait">
                            {selectedConversation ? (
                                <motion.div
                                    key={selectedConversation.id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    className="h-full"
                                >
                                    <Card className="h-full border-border/40 bg-card/60 backdrop-blur-xl shadow-xl ring-1 ring-white/5 flex flex-col pt-0">
                                        <CardHeader className="p-3 border-b border-border/10 bg-muted/10">
                                            <CardTitle className="text-sm font-semibold truncate">
                                                {selectedConversation.title || "Untitled"}
                                            </CardTitle>
                                            <CardDescription className="text-[11px] flex items-center gap-2">
                                                <span>Mode: <span className="capitalize text-foreground/80 font-medium">{selectedConversation.mode}</span></span>
                                                <span className="h-3 w-px bg-border/40" />
                                                <span>{selectedConversation.messages.length} messages</span>
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="p-3 flex-1 overflow-hidden">
                                            <div className="h-[550px] overflow-y-auto pr-1 space-y-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                                {selectedConversation.messages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                                                    >
                                                        <div className={`p-1.5 rounded-md h-7 w-7 flex items-center justify-center shrink-0 
                                                            ${msg.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-muted border border-border/40'}`}
                                                        >
                                                            {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                                                        </div>
                                                        <div className={`p-2.5 rounded-xl text-[13px] leading-relaxed wrap-break-word shadow-sm
                                                            ${msg.role === 'user' 
                                                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                                                : 'bg-card/80 border border-border/30 rounded-tl-none backdrop-blur-md'}`}
                                                        >
                                                            {msg.content}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : (
                                <div className="h-full border border-dashed border-border/30 rounded-xl bg-card/20 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6 text-muted-foreground/60">
                                    <MessageSquare className="h-10 w-10 stroke-1 text-muted-foreground/30 mb-2 animate-pulse" />
                                    <p className="font-medium text-sm">No log selected</p>
                                    <p className="text-[11px] mt-0.5 opacity-70">Select one from the left node list.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
