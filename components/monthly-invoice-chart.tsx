"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { getAuthData } from "@/services/auth"
import { getRequest } from "@/services/api"

export function MonthlyInvoiceChart() {
  const [data, setData] = useState<{ month: string; totalAmount: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const authData = getAuthData()
        const companyId = authData?.user?.company?.id
        if (!companyId) throw new Error("Company ID not found")
        const res: any = await getRequest(`/company/invoices/paid-by-month/${companyId}`)
        setData(res.data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="h-[350px] flex items-center justify-center">Loading...</div>
  }
  if (error) {
    return <div className="h-[350px] flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={(value) => `USD ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
        <Tooltip formatter={(value) => [`USD ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Amount"]} />
        <Bar dataKey="totalAmount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
