"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { ShieldAlert, Loader2, KeyRound } from "lucide-react"
import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp"

const DeviceAuthPage = () => {
    const [userCode, setUserCode] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (userCode.length < 8) return;

        setIsLoading(true)
        setError(null)
        try {
            const formattedCode = userCode.trim().toUpperCase();
            const response = await authClient.device({
                query: { user_code: formattedCode },
            });

            if (response.data) {
                window.location.href = `/device/approve?user_code=${formattedCode}`;
            }
        } catch {
            setError("Invalid or expired code. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 overflow-hidden bg-background">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <CardHeader className="relative pb-6 pt-10 flex flex-col items-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 rounded-full blur-2xl -z-10" />

                        <div className="h-20 w-20 bg-background/50 border border-primary/20 shadow-xl rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10 scale-105 transition-all duration-500 hover:scale-110">
                            <ShieldAlert className="h-10 w-10 text-primary" />
                        </div>

                        <div className="text-center space-y-2">
                            <CardTitle className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-linear-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                                Device Authentication
                            </CardTitle>
                            <CardDescription className="text-sm font-medium opacity-80 px-4">
                                Enter the authorization code displayed on your CLI to link the terminal to your account.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-4 pb-8">

                            <div className="flex flex-col items-center space-y-3">
                                <label className="text-sm font-semibold flex items-center text-muted-foreground">
                                    Activation Code
                                </label>

                                <InputOTP
                                    maxLength={8}
                                    value={userCode}
                                    onChange={(value) => {
                                        setUserCode(value.toUpperCase());
                                        if (error) setError(null);
                                    }}
                                    disabled={isLoading}
                                    containerClassName="gap-2"
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} className="w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl font-bold bg-background/50 backdrop-blur-sm" />
                                        <InputOTPSlot index={1} className="w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl font-bold bg-background/50 backdrop-blur-sm" />
                                        <InputOTPSlot index={2} className="w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl font-bold bg-background/50 backdrop-blur-sm" />
                                        <InputOTPSlot index={3} className="w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl font-bold bg-background/50 backdrop-blur-sm" />
                                    </InputOTPGroup>

                                    <InputOTPSeparator />

                                    <InputOTPGroup>
                                        <InputOTPSlot index={4} className="w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl font-bold bg-background/50 backdrop-blur-sm" />
                                        <InputOTPSlot index={5} className="w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl font-bold bg-background/50 backdrop-blur-sm" />
                                        <InputOTPSlot index={6} className="w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl font-bold bg-background/50 backdrop-blur-sm" />
                                        <InputOTPSlot index={7} className="w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl font-bold bg-background/50 backdrop-blur-sm" />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            {error && (
                                <div className="text-destructive text-sm font-medium animate-in slide-in-from-top-2 flex items-center gap-2 bg-destructive/10 px-4 py-2 rounded-md">
                                    <ShieldAlert className="h-4 w-4" />
                                    {error}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="bg-muted/30 border-t border-border/10 px-8 py-6 flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full cursor-pointer h-12 text-sm font-medium transition-all duration-200 flex items-center justify-center shadow-lg shadow-primary/20"
                                disabled={isLoading || userCode.length < 8}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Verifying Application...
                                    </>
                                ) : (
                                    "Authorize Device"
                                )}
                            </Button>

                            <p className="text-xs text-center text-muted-foreground px-2">
                                This code is unique to your device and will expire shortly. Keep it confidential and do not share it.
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export default DeviceAuthPage