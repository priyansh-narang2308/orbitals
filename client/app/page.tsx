"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader } from "@/components/ui/loader"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
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

const HomePage = () => {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      setSigningOut(true)
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in")
          }
        }
      })
    } catch (error) {
      console.error("Sign-out Error:", error)
      setSigningOut(false)
    }
  }

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in")
    }
  }, [session, isPending, router])

  if (isPending || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4 animate-in fade-in duration-500">
        <Loader />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Syncing your orbits...</p>
      </div>
    )
  }

  const { user } = session

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">


        <Card className="border-border/40 bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
          <CardHeader className="relative pb-0 pt-10 flex flex-col items-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/30 rounded-full blur-2xl -z-10" />

            <Avatar className="h-28 w-28 border-4 border-background/50 shadow-2xl scale-105 transition-all duration-500 hover:scale-110">
              <AvatarImage src={user.image ?? ""} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {user.name?.charAt(0) ?? "O"}
              </AvatarFallback>
            </Avatar>

            <div className="mt-8 text-center px-4">
              <CardTitle className="text-2xl font-extrabold tracking-tight sm:text-3xl bg-linear-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
                {user.name}
              </CardTitle>
              <CardDescription className="text-sm mt-1 font-medium opacity-70">
                {user.email}
              </CardDescription>
            </div>
          </CardHeader>


          <CardFooter className="bg-muted/30 border-t border-border/10 px-8 py-8 flex flex-col gap-3">


            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full cursor-pointer h-12 text-sm text-white font-medium transition-all duration-200 flex items-center justify-center shadow-lg shadow-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out from Orbitals
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card/90 backdrop-blur-xl border-border/40 shadow-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ending your session will disconnect your local environment from the Orbitals cloud.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {signingOut ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin font-bold" />
                    ) : (
                      <LogOut className="mr-2 h-4 w-4" /> 
                    )}
                    {signingOut ? "Signing out..." : "Sign Out"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>


      </div>
    </div>
  )
}

export default HomePage