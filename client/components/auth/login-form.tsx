"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Button } from "../ui/button"
import { authClient } from "@/lib/auth-client"
import { Loader2 } from "lucide-react"
import { Loader } from "../ui/loader"

const LoginForm = () => {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { data: session, isPending } = authClient.useSession()

    useEffect(() => {
        if (session) {
            const params = new URLSearchParams(window.location.search);
            const callbackURL = params.get("callbackURL") || "/";
            router.push(callbackURL);
        }
    }, [session, router])

    if (isPending || session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 animate-in fade-in duration-500">
                <Loader />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing your orbits...</p>
            </div>
        )
    }


    const handleGithubLogin = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams(window.location.search);
            const callbackURL = params.get("callbackURL") || "http://localhost:3000";

            await authClient.signIn.social({
                provider: "github",
                callbackURL: callbackURL.startsWith("http") ? callbackURL : `http://localhost:3000${callbackURL}`
            })
        } catch (error) {
            console.error("Login Error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full px-4 sm:px-6">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700" />

            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="text-center space-y-3">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20 backdrop-blur-sm">
                            <Image
                                src="/logo.png"
                                alt="Orbital Logo"
                                height={48}
                                width={48}
                                className="dark:invert opacity-90 transition-transform group-hover:scale-110"
                            />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Orbital CLI
                    </h1>
                    <p className="text-muted-foreground text-base max-w-[280px] mx-auto">
                        Connect your account to activate device flow and start building.
                    </p>
                </div>

                <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                    <CardHeader className="text-center pt-8 pb-4">
                        <CardTitle className="text-xl font-semibold">Sign In</CardTitle>
                        <CardDescription>
                            Welcome back! Please authenticate via GitHub.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="px-6 pb-8 pt-2">
                        <div className="flex flex-col gap-4">
                            <Button
                                variant="outline"
                                size="lg"
                                disabled={loading}
                                onClick={handleGithubLogin}
                                className="w-full cursor-pointer h-14 relative group flex items-center justify-center gap-3 text-base font-medium transition-all hover:bg-accent hover:border-accent active:scale-[0.98] border-border/60"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : (
                                    <Image
                                        src="/github.svg"
                                        alt=""
                                        height={20}
                                        width={20}
                                        className="dark:invert opacity-80"
                                    />
                                )}
                                <span>{loading ? "Connecting..." : "Continue with GitHub"}</span>
                            </Button>

                            <p className="text-center text-[11px] text-muted-foreground/60 px-4">
                                Secure authentication powered by GitHub OAuth.
                            </p>
                        </div>
                    </CardContent>


                </Card>

            </div>
        </div>
    )
}

export default LoginForm