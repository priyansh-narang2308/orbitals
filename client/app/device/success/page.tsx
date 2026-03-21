"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { CheckCircle2, Terminal } from "lucide-react"

const DeviceSuccessPage = () => {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 overflow-hidden bg-background">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <CardHeader className="relative pb-6 pt-10 flex flex-col items-center text-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -z-10" />
                        
                        <div className="relative mb-6 scale-105 transition-all duration-500 hover:scale-110">
                            <div className="h-20 w-20 bg-emerald-50 shadow-xl rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-linear-to-b from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                                Authorization Complete
                            </CardTitle>
                            <CardDescription className="text-base font-medium opacity-80 px-2 mt-2">
                                Your CLI session is now successfully authenticated.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center justify-center space-y-4 pt-2 pb-8 px-8">
                        <div className="w-full bg-muted/40 rounded-xl p-5 flex flex-col items-center text-center border border-border/30 shadow-inner">
                            <p className="text-sm font-semibold text-foreground">
                                You can safely close this window.
                            </p>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                                Return to your terminal to continue using Orbital.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default DeviceSuccessPage
