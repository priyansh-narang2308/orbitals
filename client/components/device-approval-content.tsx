"use client"

import { authClient } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader } from "./ui/loader";

const DeviceApprovalContent = () => {

    const { data, isPending } = authClient.useSession()
    const router = useRouter();

    const searchParams = useSearchParams();
    const userCode = searchParams.get("user_code")

    const [isProcessing, setIsProcessing] = useState({
        approve: false,
        deny: false,
    });

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background">
                <Loader />
            </div>
        );
    }

    if (!data?.session && !data?.user) {
        router.push("/sign-in");
        return null;
    }



    return (
        <div>DeviceApprovalContent</div>
    )
}

export default DeviceApprovalContent