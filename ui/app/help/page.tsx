"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FaQuestionCircle, FaSearch, FaBolt, FaMapPin, FaCreditCard, FaPhone, FaEnvelope, FaChevronDown, FaChevronUp } from "react-icons/fa"
import Link from "next/link"
import Navbar from "@/components/navbar"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: 'general' | 'booking' | 'payment' | 'technical'
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'general',
    question: 'How do I find charging stations near me?',
    answer: 'Use our interactive map to find charging stations in your area. You can filter by station type, availability, and charging speed. The map shows real-time availability and allows you to get directions to any station.'
  },
  {
    id: '2',
    category: 'booking',
    question: 'How do I book a charging session?',
    answer: 'To book a charging session: 1) Go to the Schedule page, 2) Search for and select a charging station, 3) Choose your preferred date and time, 4) Select the number of chargers needed, 5) Confirm your booking. You&apos;ll receive a confirmation email with all the details.'
  },
  {
    id: '3',
    category: 'booking',
    question: 'Can I cancel or modify my booking?',
    answer: 'Yes, you can cancel bookings from your Dashboard or Bookings page. Cancellations made more than 2 hours before the session start time are free. For modifications, cancel your current booking and create a new one.'
  },
  {
    id: '4',
    category: 'payment',
    question: 'What payment methods are accepted?',
    answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express). You can add multiple payment methods to your account and set a default one. All payments are processed securely.'
  },
  {
    id: '5',
    category: 'payment',
    question: 'How is charging cost calculated?',
    answer: 'Charging costs are calculated based on: 1) Duration of your session, 2) Number of chargers used, 3) Station pricing (varies by location), 4) Time of day (some stations have peak/off-peak rates). You&apos;ll see an estimated cost before confirming your booking.'
  },
  {
    id: '6',
    category: 'technical',
    question: 'What if a charger is not working?',
    answer: 'If you encounter a faulty charger: 1) Check the station display for error messages, 2) Try a different charger if available, 3) Contact station support using the number provided at the station, 4) Report the issue through our app for future reference.'
  },
  {
    id: '7',
    category: 'general',
    question: 'What\'s the difference between operator and driver accounts?',
    answer: 'Driver accounts can book charging sessions, view history, and manage payments. Operator accounts have additional privileges to manage charging stations, view analytics, and handle station-related operations.'
  },
  {
    id: '8',
    category: 'technical',
    question: 'How do I know if my vehicle is compatible?',
    answer: 'Most modern electric vehicles are compatible with our charging network. Check your vehicle\'s charging port type and maximum charging speed. Our stations support Type 2, CCS, and CHAdeMO connectors with various power levels.'
  }
]

const categories = [
  { key: 'all', label: 'All Topics', icon: FaQuestionCircle },
  { key: 'general', label: 'General', icon: FaBolt },
  { key: 'booking', label: 'Booking & Scheduling', icon: FaMapPin },
  { key: 'payment', label: 'Payments & Billing', icon: FaCreditCard },
  { key: 'technical', label: 'Technical Support', icon: FaPhone }
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <div className="flex h-screen flex-col w-screen overflow-hidden">
      <header>
        <Navbar />
      </header>
      <main className="flex-1 bg-[#14213d] p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFA500] rounded-full mb-4">
              <FaQuestionCircle className="h-8 w-8 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Help Center</h1>
            <p className="text-gray-300">Find answers to common questions about SparkFlow charging services</p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-gray-300"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => {
              const IconComponent = category.icon
              return (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                  className={selectedCategory === category.key ? 
                    "bg-[#FFA500] text-black" : 
                    "text-white border-white hover:bg-white/10"
                  }
                >
                  <IconComponent className="mr-2 h-3 w-3" />
                  {category.label}
                </Button>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <FaMapPin className="h-8 w-8 text-[#FFA500] mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Find Stations</h3>
                <p className="text-sm text-gray-300 mb-3">Locate charging stations near you</p>
                <Link href="/map">
                  <Button variant="outline" size="sm" className="text-white border-white">
                    Open Map
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <FaBolt className="h-8 w-8 text-[#FFA500] mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Book Session</h3>
                <p className="text-sm text-gray-300 mb-3">Schedule your charging session</p>
                <Link href="/schedule">
                  <Button variant="outline" size="sm" className="text-white border-white">
                    Schedule Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-4 text-center">
                <FaPhone className="h-8 w-8 text-[#FFA500] mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Contact Support</h3>
                <p className="text-sm text-gray-300 mb-3">Get direct help from our team</p>
                <Button variant="outline" size="sm" className="text-white border-white">
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-8">
                  <FaQuestionCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                  <p className="text-gray-300">
                    Try adjusting your search terms or browse different categories.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFAQs.map((faq) => (
                    <div key={faq.id} className="border border-white/20 rounded-lg">
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full flex justify-between items-center p-4 text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="font-medium text-white">{faq.question}</span>
                        {expandedFAQ === faq.id ? (
                          <FaChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <FaChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-4 pb-4">
                          <div className="text-gray-300 leading-relaxed">
                            {faq.answer}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Still Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help!
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <FaEnvelope className="h-5 w-5 text-[#FFA500]" />
                  <div>
                    <div className="font-medium text-white">Email Support</div>
                    <div className="text-sm text-gray-300">support@sparkflow.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <FaPhone className="h-5 w-5 text-[#FFA500]" />
                  <div>
                    <div className="font-medium text-white">Phone Support</div>
                    <div className="text-sm text-gray-300">+1 (555) 123-4567</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-400">
                Support hours: Monday-Friday 8AM-8PM, Weekend 9AM-5PM
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}