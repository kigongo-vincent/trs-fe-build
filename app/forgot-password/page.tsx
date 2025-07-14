"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { requestPasswordReset, verifyResetToken, resetPassword } from "@/services/auth";
import Image from "next/image";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Step 1: Request reset token
    const handleRequestToken = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await requestPasswordReset(email);
            setStep(2);
            setSuccess("A reset token has been sent to your email.");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to send reset token.");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify token
    const handleVerifyToken = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await verifyResetToken(token);
            setStep(3);
            setSuccess(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Invalid or expired token.");
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setIsLoading(false);
            return;
        }
        try {
            await resetPassword(token, newPassword);
            setSuccess("Password reset successful. You can now log in.");
            setTimeout(() => router.push("/"), 2000);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to reset password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            {/* Split layout */}
            <div className="flex w-[80vw] min-h-[80vh] bg-white dark:bg-card rounded-2xl shadow-lg shadow-gray-100 dark:shadow-gray-900 overflow-hidden relative z-10">
                {/* Left: Image + logo */}
                <div className="hidden md:flex flex-col justify-between w-[50%] bg-black/40 relative">
                    <Image
                        src="https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                        alt="Forgot password background"
                        fill
                        className="object-cover object-center absolute inset-0 -z-10"
                        priority
                    />
                    {/* Logo */}
                    <div className="p-6">
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white drop-shadow">Task Reporting System</span>
                        </div>
                    </div>
                </div>
                {/* Right: Forgot password form */}
                <div className="flex-1 flex flex-col justify-center items-center p-8">
                    <div className="w-full max-w-md">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-primary">Forgot your password?</h1>
                        <p className="text-gray-500 mb-8">Reset your password in three easy steps.</p>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
                        </div>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert variant="default" className="mb-4">
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}
                        {/* Step 1: Email */}
                        {step === 1 && (
                            <form onSubmit={handleRequestToken} className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                        placeholder="Enter your email"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Sending..." : "Send Reset Token"}
                                    </Button>
                                </div>
                            </form>
                        )}
                        {/* Step 2: Token */}
                        {step === 2 && (
                            <form onSubmit={handleVerifyToken} className="space-y-4">
                                <div>
                                    <Label htmlFor="token">Reset Token</Label>
                                    <Input
                                        id="token"
                                        type="text"
                                        value={token}
                                        onChange={e => setToken(e.target.value)}
                                        required
                                        autoFocus
                                        placeholder="Enter the token from your email"
                                    />
                                </div>
                                <div className="flex justify-between gap-2">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() => {
                                            setError(null);
                                            setSuccess(null);
                                            setStep(step - 1);
                                        }}
                                        disabled={isLoading}
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Verifying..." : "Verify Token"}
                                    </Button>
                                </div>
                            </form>
                        )}
                        {/* Step 3: New Password */}
                        {step === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        required
                                        autoFocus
                                        placeholder="Enter new password"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Confirm new password"
                                    />
                                </div>
                                <div className="flex justify-between gap-2">
                                    <Button
                                        variant="ghost"
                                        type="button"
                                        onClick={() => {
                                            setError(null);
                                            setSuccess(null);
                                            setStep(step - 1);
                                        }}
                                        disabled={isLoading}
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? "Resetting..." : "Reset Password"}
                                    </Button>
                                </div>
                            </form>
                        )}
                        <div className=" text-sm mt-6 text-muted-foreground">
                            Remembered your password?{' '}
                            <a href="/" className="text-primary font-medium hover:underline">Log in</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 