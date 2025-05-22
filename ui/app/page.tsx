import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
export default function Home() {


  return (
    <div className="items-center justify-items-center min-h-screen bg-[#14213D] text-[#FCA311]">
      <main className="flex flex-col items-center justify-start w-full p-10 sm:items-start h-full">
        <div className="mb-10 md:mb-0 h-screen flex flex-col justify-center w-screen">
          <div className="flex flex-row items-center justify-between px-12 w-full">
            <div className="flex flex-col items-start justify-start">
              <h1 className="text-white text-6xl md:text-8xl font-bold">
                LET YOUR
                <span className="block text-[#FFA500]">SPARK</span>
                <span className="block font-cursive text-white italic">FLOW</span>
              </h1>
            </div>
            <div className="flex flex-col items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-3xl h-auto max-w-xs md:max-w-md mr-12" />
            </div>
          </div>
          <p className="text-white p-12 text-lg max-w-xl">
            The unified EU charging platform that connects EV drivers and station operators through a centralized and
            data-driven experience
          </p>
        </div>
        <div className="mt-8">
          <img src="/charger.png" alt="Charging Cable" className="w-48 h-auto" />
        </div>
        <div className="w-full max-w-md">
          <Card className="bg-[#FFA500]">
            <CardContent className="p-10">
              <h2 className="text-4xl font-bold text-center text-[#14213d] mb-4">Filter</h2>
              <h3 className="text-3xl font-semibold text-center text-[#14213d] mb-8">charging stations</h3>

              <Link href="/map">
                <Button className="w-full py-6 text-xl font-semibold bg-[#14213d] hover:bg-[#14213d]/90">
                  FIND STATIONS NEAR ME
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
