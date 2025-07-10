import Link from "next/link"

export function MainNav() {
  return (
    <div className="flex items-center">
      <Link href="/dashboard" className="flex items-center">
        {/* <div className="flex items-center justify-center w-8 h-8 rounded bg-primary">
          <span className="text-xs font-bold text-white">TRS</span>
        </div> */}
        <span className="text-xl font-bold text-primary hidden md:inline-block">Task Reporting System</span>
      </Link>
    </div>
  )
}
