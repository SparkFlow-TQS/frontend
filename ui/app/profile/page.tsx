"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { FaUser, FaSave, FaEdit, FaBolt, FaCrown } from "react-icons/fa"
import Navbar from "@/components/navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        username: user.username,
        email: user.email
      }))
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      // Validate password fields if changing password
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          throw new Error('New passwords do not match')
        }
        if (profileData.newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters long')
        }
        if (!profileData.currentPassword) {
          throw new Error('Current password is required to change password')
        }
      }

      // In a real app, this would make API calls to update user profile
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditing(false)
      
      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setMessage(null)
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  // Demo statistics
  const userStats = {
    totalSessions: 45,
    totalSpent: 234.50,
    favoriteStation: 'Central Station',
    memberSince: 'March 2024',
    totalKwh: 678.5,
    co2Saved: 152.3
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col w-screen overflow-hidden">
        <header>
          <Navbar />
        </header>
        <main className="flex-1 bg-[#14213d] p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                <p className="text-gray-300 mt-2">Manage your account information and preferences</p>
              </div>
              {!isEditing && (
                <Button 
                  onClick={() => setIsEditing(true)}
                  className="bg-[#FFA500] text-black hover:bg-[#FFA500]/90"
                >
                  <FaEdit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FaUser className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {message && (
                      <div className={`mb-4 p-3 rounded text-sm ${
                        message.type === 'success' 
                          ? 'bg-green-500/20 border border-green-500/50 text-green-100'
                          : 'bg-red-500/20 border border-red-500/50 text-red-100'
                      }`}>
                        {message.text}
                      </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-4">
                      <div>
                        <Label htmlFor="username" className="text-white">Username</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={handleInputChange('username')}
                          disabled={!isEditing}
                          className="bg-white/20 border-white/30 text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleInputChange('email')}
                          disabled={!isEditing}
                          className="bg-white/20 border-white/30 text-white disabled:opacity-50"
                        />
                      </div>

                      <div>
                        <Label className="text-white">Account Type</Label>
                        <div className="mt-1">
                          <Badge className={user?.isOperator ? 
                            "bg-purple-100 text-purple-800" : 
                            "bg-blue-100 text-blue-800"
                          }>
                            {user?.isOperator ? (
                              <>
                                <FaCrown className="mr-1 h-3 w-3" />
                                Station Operator
                              </>
                            ) : (
                              <>
                                <FaBolt className="mr-1 h-3 w-3" />
                                Driver
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      {isEditing && (
                        <>
                          <hr className="border-white/20" />
                          <h3 className="text-lg font-semibold text-white">Change Password</h3>
                          <p className="text-sm text-gray-300">Leave blank to keep current password</p>
                          
                          <div>
                            <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={profileData.currentPassword}
                              onChange={handleInputChange('currentPassword')}
                              className="bg-white/20 border-white/30 text-white"
                            />
                          </div>

                          <div>
                            <Label htmlFor="newPassword" className="text-white">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={profileData.newPassword}
                              onChange={handleInputChange('newPassword')}
                              className="bg-white/20 border-white/30 text-white"
                            />
                          </div>

                          <div>
                            <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={profileData.confirmPassword}
                              onChange={handleInputChange('confirmPassword')}
                              className="bg-white/20 border-white/30 text-white"
                            />
                          </div>
                        </>
                      )}

                      {isEditing && (
                        <div className="flex gap-3 pt-4">
                          <Button 
                            type="submit" 
                            disabled={isSaving}
                            className="bg-[#FFA500] text-black hover:bg-[#FFA500]/90"
                          >
                            <FaSave className="mr-2 h-4 w-4" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                          <Button 
                            type="button"
                            variant="outline" 
                            onClick={handleCancel}
                            className="text-white border-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* User Statistics */}
              <div className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#FFA500]">{userStats.totalSessions}</div>
                      <div className="text-sm text-gray-300">Total Sessions</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#FFA500]">€{userStats.totalSpent}</div>
                      <div className="text-sm text-gray-300">Total Spent</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium text-white">{userStats.favoriteStation}</div>
                      <div className="text-xs text-gray-300">Favorite Station</div>
                    </div>

                    <div className="text-center">
                      <div className="text-sm font-medium text-white">{userStats.memberSince}</div>
                      <div className="text-xs text-gray-300">Member Since</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Environmental Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{userStats.totalKwh} kWh</div>
                      <div className="text-sm text-gray-300">Total Energy Used</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-bold text-green-400">{userStats.co2Saved} kg</div>
                      <div className="text-sm text-gray-300">CO₂ Emissions Saved</div>
                    </div>

                    <div className="text-xs text-gray-400 text-center">
                      Compared to equivalent gasoline vehicle usage
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full text-white border-white"
                      onClick={() => window.location.href = '/bookings'}
                    >
                      View My Bookings
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-white border-white"
                      onClick={() => window.location.href = '/payments'}
                    >
                      Payment Methods
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-white border-white"
                      onClick={() => window.location.href = '/history'}
                    >
                      Charging History
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}