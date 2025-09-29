import Link from "next/link"
import Image from "next/image"
import LogoPrimary from "@/assets/logo-primary.png"

export function MainNav({ light }: { light?: boolean }) {
  
  return (
    <div className="flex items-center">
      <Link href="/dashboard" className="flex items-center" aria-label="Go to dashboard">
        {/* <div className="flex items-center justify-center w-8 h-8 rounded bg-primary">
          <span className="text-xs font-bold text-white">TRS</span>
        </div> */}

        <span className="text-xl font-bold hidden md:inline-block">

          {
            light
              ?

              <Image height={200} width={400} className="h-[50px] w-max" src="https://trs-v1.netlify.app/assets/icons/logo.svg" alt="TRS" priority />
              :
              <Image className="h-[40px] w-max" src={LogoPrimary} alt="TRS" priority />
          }
        </span>
      </Link>
    </div>
  )
}
