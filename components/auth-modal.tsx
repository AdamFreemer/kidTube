"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Lock, Eye, EyeOff } from "lucide-react"

interface AuthModalProps {
  onAuthenticated: () => void
}

export function AuthModal({ onAuthenticated }: AuthModalProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const STATIC_PASSWORD = "2manysecrets"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (password === STATIC_PASSWORD) {
      // Store authentication in localStorage
              localStorage.setItem("kidvid-authenticated", "true")
      onAuthenticated()
    } else {
      setError("Incorrect password. Please try again.")
      setPassword("")
    }

    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-orange-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome to KidVid! 🎬
          </CardTitle>
          <p className="text-purple-600 text-base font-medium">Please enter the password to continue</p>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label htmlFor="password" className="text-sm font-bold text-purple-700">
                Password 🔐
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pr-12 h-12 border-2 border-purple-200 focus:border-purple-400 focus:ring-purple-400 bg-gradient-to-r from-purple-50 to-pink-50"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-purple-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-purple-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-700 text-sm bg-red-100 p-4 rounded-lg border-2 border-red-200 font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Verifying...
                </>
              ) : (
                "Enter KidVid 🚀"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-purple-500 font-medium">
              This is a protected demo site. Contact the administrator for access. ✨
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
