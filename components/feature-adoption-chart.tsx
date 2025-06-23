"use client"

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "@/components/ui/chart"

const data = [
  {
    feature: "Task Creation",
    adoption: 95,
  },
  {
    feature: "Time Logging",
    adoption: 80,
  },
  {
    feature: "Reports",
    adoption: 70,
  },
  {
    feature: "Invoicing",
    adoption: 65,
  },
  {
    feature: "Analytics",
    adoption: 55,
  },
  {
    feature: "Mobile App",
    adoption: 40,
  },
]

export function FeatureAdoptionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="feature" />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar name="Adoption Rate %" dataKey="adoption" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  )
}
