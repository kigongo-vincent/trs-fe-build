import Link from "next/link"
import Image from "next/image"
import LogoPrimary from "@/assets/logo-primary.png"

export function MainNav() {
  return (
    <div className="flex items-center">
      <Link href="/dashboard" className="flex items-center" aria-label="Go to dashboard">
        {/* <div className="flex items-center justify-center w-8 h-8 rounded bg-primary">
          <span className="text-xs font-bold text-white">TRS</span>
        </div> */}

        <span className="text-xl font-bold hidden md:inline-block">
          <Image className="h-[40px] w-max" src={LogoPrimary} alt="TRS" priority />
        </span>
      </Link>
    </div>
  )
}
