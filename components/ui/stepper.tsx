"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
    id: number
    title: string
    description?: string
}

interface StepperProps {
    steps: Step[]
    currentStep: number
    onStepClick?: (step: number) => void
    className?: string
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
    ({ steps, currentStep, onStepClick, className }, ref) => {
        return (
            <div ref={ref} className={cn("w-full relative z-10", className)}>
                {/* Desktop Stepper */}
                <div className="hidden sm:block">
                    <div className="flex items-center justify-between relative">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex flex-col items-center flex-1 relative">
                                {/* Connector line */}
                                {index < steps.length - 1 && (
                                    <div className="absolute top-4 left-1/2 w-full h-0.5 z-0">
                                        <div className="h-full bg-gray-200 rounded-full" />
                                        <motion.div
                                            className="h-full bg-primary rounded-full absolute top-0 left-0"
                                            initial={{ width: "0%" }}
                                            animate={{
                                                width: currentStep > step.id ? "100%" : "0%"
                                            }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        />
                                    </div>
                                )}

                                {/* Step circle */}
                                <motion.div
                                    onClick={() => onStepClick?.(step.id)}
                                    className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-full font-semibold text-base transition-all duration-300 relative z-20 cursor-pointer",
                                        currentStep > step.id
                                            ? "bg-green-500 text-white"
                                            : currentStep === step.id
                                                ? "bg-primary text-white shadow-lg"
                                                : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                                    )}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ scale: 1 }}
                                    animate={{
                                        scale: currentStep === step.id ? 1.05 : 1
                                    }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    {currentStep > step.id ? (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        >
                                            <Check className="h-4 w-4" />
                                        </motion.div>
                                    ) : (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {step.id}
                                        </motion.span>
                                    )}
                                </motion.div>

                                {/* Step label */}
                                <div className="mt-3 text-center">
                                    <motion.div
                                        className={cn(
                                            "text-sm font-medium transition-colors duration-300",
                                            currentStep >= step.id ? "text-black" : "text-gray-500"
                                        )}
                                        animate={{
                                            color: currentStep >= step.id ? "#000000" : "#6B7280"
                                        }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {step.title}
                                    </motion.div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Stepper */}
                <div className="block sm:hidden">
                    <div className="flex items-center justify-between mb-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <motion.div
                                    className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300",
                                        currentStep > step.id
                                            ? "bg-green-500 text-white"
                                            : currentStep === step.id
                                                ? "bg-primary text-white shadow-lg"
                                                : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                                    )}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ scale: 1 }}
                                    animate={{
                                        scale: currentStep === step.id ? 1.05 : 1
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {currentStep > step.id ? (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        >
                                            <Check className="h-4 w-4" />
                                        </motion.div>
                                    ) : (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {step.id}
                                        </motion.span>
                                    )}
                                </motion.div>

                                {/* Connector for mobile */}
                                {index < steps.length - 1 && (
                                    <div className="flex-1 mx-2 h-0.5">
                                        <div className="h-full bg-gray-200 rounded-full" />
                                        <motion.div
                                            className="h-full bg-primary rounded-full absolute top-0 left-0"
                                            initial={{ width: "0%" }}
                                            animate={{
                                                width: currentStep > step.id ? "100%" : "0%"
                                            }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Current step info for mobile */}
                    <motion.div
                        className="text-center mt-4"
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="text-lg font-semibold text-black">
                            {steps[currentStep - 1]?.title}
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }
)

Stepper.displayName = "Stepper"

export { Stepper, type Step }
