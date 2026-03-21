"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { CheckCircle, XCircle, ShieldAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";

const DeviceApprovalContent = () => {

    const { data, isPending } = authClient.useSession()
    const router = useRouter();

    const searchParams = useSearchParams();
    const userCode = searchParams.get("user_code")

    const [isProcessing, setIsProcessing] = useState({
        approve: false,
        deny: false,
    });

    useEffect(() => {
        if (!isPending && !data?.session) {
            router.push(`/sign-in?callbackURL=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        }
    }, [data, isPending, router]);

    if (isPending || !data?.session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 animate-in fade-in duration-500">
                <Loader />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Authenticating session...</p>
            </div>
        );
    }

    const handleApprove = async () => {
        setIsProcessing({ approve: true, deny: false });
        try {
            toast.loading("Authenticating terminal...", { id: "loading" });
            await authClient.device.approve({ userCode: userCode! });
            toast.dismiss("loading");
            router.push("/device/success");
        } catch {
            toast.dismiss("loading");
            toast.error("Failed to approve device");
            setIsProcessing({ approve: false, deny: false });
        }
    }

    const handleDeny = async () => {
        setIsProcessing({ approve: false, deny: true });
        try {
            toast.loading("Denying device...", { id: "deny" });
            await authClient.device.deny({ userCode: userCode! });
            toast.dismiss("deny");
            toast.success("Device access denied.");
            router.push("/");
        } catch {
            toast.dismiss("deny");
            toast.error("Failed to deny device");
        } finally {
            setIsProcessing({ approve: false, deny: false });
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 overflow-hidden bg-background">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

            <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
                    <CardHeader className="relative pb-6 pt-10 flex flex-col items-center text-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 rounded-full blur-2xl -z-10" />

                        <div className="relative mb-6 transition-all duration-500 ">
                            <div className="h-20 w-20 shadow-xl rounded-full flex items-center justify-center p-2">
                                <Image
                                    src="/white.png"
                                    alt="Logo"
                                    width={100}
                                    height={100}
                                    className="h-full w-full object-contain"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-linear-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                                Device Authorization
                            </CardTitle>
                            <CardDescription className="text-sm font-medium opacity-80 px-2">
                                A new device is requesting access to your Orbital account.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center justify-center space-y-6 pt-2 pb-6 px-8">

                        <div className="w-full space-y-2 text-center">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Authorization Code
                            </p>
                            <div className="bg-background/80 shadow-inner rounded-xl p-4 border border-border/50">
                                <p className="text-2xl font-mono font-bold text-primary tracking-[0.3em]">
                                    {userCode || "--------"}
                                </p>
                            </div>
                        </div>

                        <div className="w-full bg-muted/40 rounded-xl p-4 flex gap-3 items-start border border-border/30">
                            <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div className="space-y-1 text-left">
                                <p className="text-xs font-semibold text-foreground">
                                    Account: {data?.user?.email}
                                </p>
                                <p className="text-[11px] text-muted-foreground leading-relaxed">
                                    Only approve this request if you initiated it from your terminal. If you do not recognize this request, deny it immediately.
                                </p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/30 border-t border-border/10 px-8 py-6 flex flex-col gap-3">
                        <Button
                            onClick={handleApprove}
                            disabled={isProcessing.approve || isProcessing.deny}
                            className="w-full h-12 text-sm font-medium bg-green-600 hover:bg-green-700 text-white transition-all duration-200 flex items-center justify-center shadow-lg shadow-green-600/20 cursor-pointer"
                        >
                            {isProcessing.approve ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve Device
                                </>
                            )}
                        </Button>
                        <Button
                            onClick={handleDeny}
                            disabled={isProcessing.approve || isProcessing.deny}
                            variant="destructive"
                            className="w-full h-12 text-sm font-medium transition-all bg-destructive/90 hover:bg-destructive duration-200 flex items-center justify-center shadow-lg shadow-destructive/20 cursor-pointer"
                        >
                            {isProcessing.deny ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Denying...
                                </>
                            ) : (
                                <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Deny Access
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default DeviceApprovalContent