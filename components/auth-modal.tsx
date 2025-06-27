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
      localStorage.setItem("kidtube-authenticated", "true")
      onAuthenticated()
    } else {
      setError("Incorrect password. Please try again.")
      setPassword("")
    }

    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border border-gray-200 shadow-lg">
        <CardHeader className="text-center border-b border-gray-100">
          <div className="mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 text-gray-600" />
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900">Welcome to KidTube</CardTitle>
          <p className="text-gray-600 text-sm font-normal">Please enter the password to continue</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pr-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">{error}</div>}

            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 font-medium"
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Verifying...
                </>
              ) : (
                "Enter KidTube"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This is a protected demo site. Contact the administrator for access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
