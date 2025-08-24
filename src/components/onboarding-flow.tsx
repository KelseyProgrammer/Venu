"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Shield, CheckCircle, Megaphone } from "lucide-react"

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const onboardingSteps = [
    {
      icon: Shield,
      title: "Transparent Payments",
      description:
        "Clear payout structure with guaranteed minimums for artists, configurable percentages for bands, and promoter compensation. Everyone knows exactly what they'll earn.",
      highlight: "Guaranteed minimums + percentage splits",
    },
    {
      icon: CheckCircle,
      title: "Fair Expectations",
      description:
        "Clear checklists for artists and venues eliminate confusion. Know exactly what's expected before you book.",
      highlight: "Everyone knows the plan",
    },
    {
      icon: Megaphone,
      title: "Smarter Promotion",
      description:
        "Auto-generated promotional kits help artists and venues market events effectively with professional templates.",
      highlight: "Built-in marketing tools",
    },
  ]

  const currentStepData = onboardingSteps[currentStep]
  const IconComponent = currentStepData.icon

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="sm" onClick={prevStep} disabled={currentStep === 0} className="p-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex gap-2">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${index === currentStep ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <Button variant="ghost" size="sm" onClick={onComplete} className="text-muted-foreground text-sm">
          Skip
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
        <Card className="p-8 mb-8 bg-card border-border">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-serif font-bold text-2xl mb-3 text-foreground">{currentStepData.title}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{currentStepData.description}</p>
            <p className="text-accent font-medium text-sm">{currentStepData.highlight}</p>
          </div>
        </Card>

        <Button variant="purple" onClick={nextStep} className="w-full h-12 text-base font-medium">
          {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
