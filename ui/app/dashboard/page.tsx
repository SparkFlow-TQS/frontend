import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FaUserCircle, FaBolt, FaDollarSign, FaClock, FaLeaf, FaCreditCard, FaCalendar, FaHistory } from "react-icons/fa"
import Link from "next/link"
import Navbar from "@/components/navbar"

export default function DashboardPage() {

  const stats = [
    {
      title: "This month&apos;s costs",
      value: "$58.00",
      icon: <FaDollarSign className="h-5 w-5 text-white" />
    },
    {
      title: "This month&apos;s kWh",
      value: "40 kWh",
      icon: <FaBolt className="h-5 w-5 text-white" />
    },
    {
      title: "This month&apos;s charges",
      value: "4 times",
      icon: <FaClock className="h-5 w-5 text-white" />
    },
    {
      title: "CO2 Saved",
      value: "20 L",
      icon: <FaLeaf className="h-5 w-5 text-white" />
    }
  ]

  const sidebar_items = [
    {
      title: "My Bookings",
      icon: <FaCalendar className="h-5 w-5 text-white" />,
      href: "/bookings"
    },
    {
      title: "History",
      icon: <FaHistory className="h-5 w-5 text-white" />,
      href: "/history"
    },
    {
      title: "Payments",
      icon: <FaCreditCard className="h-5 w-5 text-white" />,
      href: "/payments"
    }
  ]

  return (
    <div className="flex h-screen flex-col w-screen overflow-hidden">
      <header>
        <Navbar />
      </header>
      <main className="p-8 h-full flex flex-row items-center bg-[#14213d] text-[#FCA311]">
        {/* Sidebar Navigation */}
        <div className="align-middle p-10 justify-center flex flex-col items-center w-1/4 text-center">
            {sidebar_items.map((items, index) => (
              <Link key={index} href={items.href} className="w-full">
                <Card className="bg-[#FFA500] cursor-pointer hover:bg-[#FFA500]/90 transition-colors mb-4">
                  <CardContent className="p-4">
                    <h2 className="text-xl font-bold text-[#14213d]">{items.title}</h2>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
        <div className="w-full px-10 max-h-full">
          <div className="flex flex-row gap-4 mb-4 align-middle justify-center">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white rounded-lg shadow-md overflow-hidden w-1/4 flex align-middle">
                <CardContent className="flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{stat.title}</p>
                      <div className="flex items-baseline">
                        <h3 className="text-2xl font-bold">{stat.value}</h3>
                        <span className="ml-2 text-sm text-green-500">+23%</span>
                      </div>
                    </div>
                    <div className="bg-[#FFA500] p-2 rounded-full align-middle flex">
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Profile */}
          <div className="flex flex-row gap-4 mb-4">
            <Card className="bg-[#FFA500] w-1/2">
              <CardContent className="p-6 flex flex-row justify-between items-center">
                <div>
                  <p className="text-sm text-[#14213d]">Welcome back,</p>
                  <h2 className="text-2xl font-bold text-[#14213d]">Gabriel Silva</h2>
                  <p className="text-[#14213d]">Glad to see you again!</p>
                  <Button className="mt-2 bg-white text-[#14213d] hover:bg-white/90">Edit Profile</Button>
                </div>
                <div className="flex flex-col items-center mt-4 md:mt-0">
                  <h3 className="text-xl font-semibold text-[#14213d]">Type of User</h3>
                  <FaUserCircle className="h-20 w-20 text-white mt-2" />
                  <p className="text-xl font-semibold text-[#14213d] mt-2">Driver</p>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <Card className="bg-white w-1/2 ">
              <CardContent className="p-4">
                <div className="h-56">
                  <div className="w-full h-full flex items-end justify-between px-4">
                    {[200, 400, 200, 380, 300, 200, 100, 350, 200, 350, 300, 220].map((height, index) => (
                      <div key={index} className="bg-green-500 w-2" style={{ height: `${height / 5}%` }}></div>
                    ))}
                  </div>
                  <div className="w-full flex justify-between mt-2 text-xs text-gray-500">
                    <span>J</span>
                    <span>F</span>
                    <span>M</span>
                    <span>A</span>
                    <span>M</span>
                    <span>J</span>
                    <span>J</span>
                    <span>A</span>
                    <span>S</span>
                    <span>O</span>
                    <span>N</span>
                    <span>D</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-row gap-4">
            {/* Weekly Chart */}
            <Card className="bg-white w-1/2">
              <CardContent className="p-4">
              <div className="h-56">
                <div className="w-full h-[80%] flex items-end justify-around">
                  {["M", "T", "W", "T", "F", "S"].map((day, index) => {
                    const heights = [75, 65, 45, 45, 70, 80, 85]
                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className="bg-green-500 w-12 rounded-sm" style={{ height: `${heights[index]}%` }}></div>
                        <span className="mt-2 text-gray-500">{day}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Chart */}
          <Card className="bg-white w-1/2">
            <CardContent className="p-4">
              <div className="h-56">
                <div className="h-full flex items-center">
                  <svg viewBox="0 0 500 200" className="w-full h-full">
                    <path
                      d="M0,100 C20,80 40,110 60,90 C80,70 100,90 120,80 C140,70 160,100 180,90 C200,80 220,110 240,100 C260,90 280,60 300,70 C320,80 340,90 360,80 C380,70 400,90 420,100 C440,110 460,90 480,100 C500,110"
                      fill="none"
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="w-full flex justify-between text-xs text-gray-500">
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                  <span>Sep</span>
                  <span>Oct</span>
                  <span>Nov</span>
                </div>
              </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}