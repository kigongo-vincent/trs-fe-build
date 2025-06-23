"use client"

import { Sankey, Tooltip, ResponsiveContainer } from "@/components/ui/chart"

const data = {
  nodes: [{ name: "Basic" }, { name: "Standard" }, { name: "Premium" }, { name: "Enterprise" }, { name: "Churned" }],
  links: [
    { source: 0, target: 1, value: 15 },
    { source: 0, target: 4, value: 5 },
    { source: 1, target: 2, value: 10 },
    { source: 1, target: 4, value: 3 },
    { source: 2, target: 3, value: 5 },
    { source: 2, target: 4, value: 2 },
  ],
}

export function PackageConversionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <Sankey
        data={data}
        nodePadding={50}
        margin={{
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
        }}
        link={{ stroke: "#d1d5db" }}
      >
        <Tooltip />
      </Sankey>
    </ResponsiveContainer>
  )
}
