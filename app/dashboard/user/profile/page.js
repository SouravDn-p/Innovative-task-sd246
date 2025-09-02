"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  User,
  Shield,
  Wallet,
  Users,
  Activity,
  Settings,
  Bell,
  Camera,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  Copy,
  QrCode,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Key,
  LogOut,
  HelpCircle,
  MessageCircle,
  Download,
  Upload,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useGetUserByEmailQuery,
  useGetKYCDataQuery,
  useGetUserTasksQuery,
  useUpdateUserMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} from "@/redux/api/api";

function UserProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: session } = useSession();
  const router = useRouter();

  const userEmail = session?.user?.email;

  // API Queries
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useGetUserByEmailQuery(userEmail, {
    skip: !userEmail,
  });

  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useGetUserProfileQuery(undefined, {
    skip: !userEmail,
  });

  const { data: kycData, isLoading: kycLoading } = useGetKYCDataQuery(
    undefined,
    {
      skip: !userEmail,
    }
  );

  const { data: taskData, isLoading: taskLoading } = useGetUserTasksQuery(
    userEmail,
    {
      skip: !userEmail,
    }
  );

  const [updateUser] = useUpdateUserMutation();
  const [updateProfile] = useUpdateUserProfileMutation();

  // Animation variants for theme consistency
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Helper function to safely get numeric values
  const safeNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Mock data for demonstration (replace with actual data when APIs are available)
  const mockUser = {
    name:
      session?.user?.name ||
      userData?.user?.name ||
      userData?.name ||
      "John Doe",
    username: userData?.user?.username || userData?.username || "john_doe_123",
    email: userEmail || session?.user?.email || "john@example.com",
    phone: userData?.user?.phone || userData?.phone || "+91 9876543210",
    image:
      session?.user?.image ||
      userData?.user?.image ||
      userData?.image ||
      "https://ui-avatars.com/api/?name=John+Doe",
    dateOfBirth:
      userData?.user?.dateOfBirth || userData?.dateOfBirth || "1990-05-15",
    walletBalance: 2450.75,
    totalEarnings: 12450.9,
    referralEarnings: 2450.5,
    taskEarnings: 10000.4,
    withdrawableBalance: 2450.75,
    referralCode:
      userData?.user?.referralId || userData?.referralId || "REF12345",
    referralCount: { today: 2, total: 23 },
    tasksCompleted: taskData?.statistics?.tasksCompleted || 156,
    pendingSubmissions: taskData?.statistics?.pendingTasks || 3,
    approvedSubmissions: 153,
    rejectedSubmissions: 0,
    weeklyProgress: 65,
    weeklyGoal: 1500,
    weeklyEarned: 975,
    suspensionCount: 0,
    kycStatus: kycData?.status || "none",
    kycPaidAt: "2024-01-15",
    isVerified: true,
    joinDate: "2024-01-15",
  };

  // Prioritize profile API data, then session data, then userData, then mock data
  const profile = profileData?.profile;
  const user = profile
    ? {
        // Use profile API data as primary source
        ...profile,
        // Safe numeric values from profile data
        walletBalance: safeNumber(profile.walletBalance),
        totalEarnings: safeNumber(profile.totalEarn || profile.totalEarnings),
        referralEarnings: safeNumber(profile.referralEarnings || 0),
        taskEarnings: safeNumber(profile.taskEarnings || profile.totalEarn),
        withdrawableBalance: safeNumber(profile.walletBalance),
        weeklyEarned: safeNumber(profile.weeklyEarnAmount),
        weeklyGoal: safeNumber(profile.weeklyGoal || 1500),
        weeklyProgress: safeNumber(profile.weeklyProgress || 0),
        // Referral data
        referralCode: profile.referralId || "REF12345",
        referralCount: {
          today: safeNumber(profile.dailyReferralsCount),
          total: safeNumber(profile.totalReferrals),
        },
        // Task statistics from profile API
        tasksCompleted: safeNumber(profile.tasksCompleted),
        pendingSubmissions: safeNumber(profile.pendingTasks),
        approvedSubmissions: safeNumber(profile.approvedSubmissions),
        rejectedSubmissions: safeNumber(profile.rejectedSubmissions),
        activeTasks: safeNumber(profile.activeTasks),
        suspensionCount: safeNumber(profile.lastSuspensionCount),
        // KYC and verification status
        kycStatus: kycData?.status || profile.kycStatus || "none",
        isVerified: profile.isVerified || false,
        // Dates
        joinDate:
          profile.joinDate ||
          new Date(profile.createdAt).toISOString().split("T")[0],
        // Profile information
        username:
          profile.username ||
          profile.name?.toLowerCase().replace(/\s+/g, "_") ||
          "user",
      }
    : {
        // Fallback to existing logic if profile API fails
        ...mockUser,
        ...(userData?.user || userData || {}),
        walletBalance: safeNumber(
          userData?.user?.walletBalance ||
            userData?.walletBalance ||
            mockUser.walletBalance
        ),
        totalEarnings: safeNumber(
          userData?.user?.totalEarn ||
            userData?.totalEarn ||
            userData?.totalEarnings ||
            mockUser.totalEarnings
        ),
        referralEarnings: safeNumber(
          userData?.user?.referralEarnings ||
            userData?.referralEarnings ||
            mockUser.referralEarnings
        ),
        taskEarnings: safeNumber(
          userData?.user?.taskEarnings ||
            userData?.taskEarnings ||
            mockUser.taskEarnings
        ),
        withdrawableBalance: safeNumber(
          userData?.user?.walletBalance ||
            userData?.walletBalance ||
            mockUser.withdrawableBalance
        ),
        weeklyEarned: safeNumber(
          userData?.user?.weeklyEarnAmount ||
            userData?.weeklyEarnAmount ||
            mockUser.weeklyEarned
        ),
        weeklyGoal: safeNumber(
          userData?.user?.weeklyGoal ||
            userData?.weeklyGoal ||
            mockUser.weeklyGoal
        ),
        weeklyProgress: safeNumber(
          userData?.user?.weeklyProgress ||
            userData?.weeklyProgress ||
            mockUser.weeklyProgress
        ),
        referralCount: {
          today: safeNumber(
            userData?.user?.dailyReferralsCount ||
              userData?.dailyReferralsCount ||
              mockUser.referralCount.today
          ),
          total: safeNumber(
            userData?.user?.Recent_Referrals?.length ||
              userData?.Recent_Referrals?.length ||
              mockUser.referralCount.total
          ),
        },
        tasksCompleted: safeNumber(
          userData?.user?.tasksCompleted ||
            userData?.tasksCompleted ||
            taskData?.statistics?.tasksCompleted ||
            mockUser.tasksCompleted
        ),
        pendingSubmissions: safeNumber(
          userData?.user?.pendingSubmissions ||
            userData?.pendingSubmissions ||
            taskData?.statistics?.pendingTasks ||
            mockUser.pendingSubmissions
        ),
        approvedSubmissions: safeNumber(
          userData?.user?.approvedSubmissions ||
            userData?.approvedSubmissions ||
            mockUser.approvedSubmissions
        ),
        rejectedSubmissions: safeNumber(
          userData?.user?.rejectedSubmissions ||
            userData?.rejectedSubmissions ||
            mockUser.rejectedSubmissions
        ),
        suspensionCount: safeNumber(
          userData?.user?.lastSuspensionCount ||
            userData?.lastSuspensionCount ||
            mockUser.suspensionCount
        ),
        kycStatus:
          kycData?.status ||
          userData?.user?.kycStatus ||
          userData?.kycStatus ||
          "none",
        isVerified: userData?.user?.isVerified || userData?.isVerified || false,
        joinDate: userData?.user?.createdAt
          ? new Date(userData.user.createdAt).toISOString().split("T")[0]
          : userData?.createdAt
          ? new Date(userData.createdAt).toISOString().split("T")[0]
          : mockUser.joinDate,
      };

  const handleSave = async () => {
    try {
      // Use the dedicated profile API for better handling
      const result = await updateProfile(editData).unwrap();

      // Show success feedback
      console.log("Profile updated successfully:", result);

      // Reset editing state
      setIsEditing(false);
      setEditData({});

      // Optional: Show toast notification here
      // toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);

      // Optional: Show error toast
      // toast.error(error?.data?.error || "Failed to update profile");

      // For now, fall back to the original user API if profile API fails
      try {
        await updateUser({
          email: userEmail,
          data: editData,
        }).unwrap();

        setIsEditing(false);
        setEditData({});
        console.log("Profile updated via fallback API");
      } catch (fallbackError) {
        console.error("Both profile update methods failed:", fallbackError);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You can add a toast notification here
  };

  const generateReferralLink = () => {
    return `${window.location.origin}/register?ref=${user.referralCode}`;
  };

  const getKYCStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getKYCStatusText = (status) => {
    switch (status) {
      case "verified":
        return "Verified";
      case "pending":
        return "Under Review";
      case "rejected":
        return "Rejected";
      default:
        return "Not Started";
    }
  };

  // Check if user is logged in
  if (!session) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="text-center space-y-6 p-6 bg-white rounded-2xl shadow-xl border border-teal-200 w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-teal-900">Access Profile</h1>
            <p className="text-teal-600">
              You need to be logged in to view your profile
            </p>
          </div>
          <div className="space-y-4">
            <Button
              onClick={() => router.push("/login")}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-700 hover:to-cyan-700 transition-all w-full"
              size="lg"
            >
              Login to Continue
            </Button>
            <p className="text-sm text-teal-600">
              Don&apos;t have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-teal-700 hover:text-teal-800"
                onClick={() => router.push("/register")}
              >
                Sign up here
              </Button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (userLoading || profileLoading || kycLoading || taskLoading) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-teal-700">Loading profile...</p>
        </div>
      </motion.div>
    );
  }

  // Show error if there's an API error
  if (userError || profileError) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center space-y-4 p-6 bg-white rounded-2xl shadow-xl border border-red-200 w-full max-w-md">
          <div className="text-red-600">
            <h2 className="text-xl font-bold mb-2">Error Loading Profile</h2>
            <p className="text-sm">
              {userError?.data?.message ||
                userError?.message ||
                profileError?.data?.message ||
                profileError?.message ||
                "Failed to load user data"}
            </p>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-teal-600 hover:bg-teal-700 w-full"
          >
            Try Again
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Profile Header Card */}
      <Card className="relative overflow-hidden border-teal-200 shadow-md hover:shadow-xl transition-shadow">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
        <CardContent className="p-4 sm:p-6 relative">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-teal-200 ring-2 ring-teal-100">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="bg-teal-500 text-white font-bold">
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0 bg-white text-teal-600 hover:bg-teal-50"
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-teal-900 break-words">
                    {user.name}
                  </h2>
                  <p className="text-sm text-teal-600">@{user.username}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-teal-200 text-teal-700 hover:bg-teal-100 whitespace-nowrap"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden xs:inline">Edit Profile</span>
                  <span className="xs:hidden">Edit</span>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="text-center p-2 bg-teal-50 rounded-lg">
                  <p className="text-lg font-bold text-teal-900">
                    ₹{safeNumber(user.walletBalance).toFixed(2)}
                  </p>
                  <p className="text-xs text-teal-600">Wallet</p>
                </div>
                <div className="text-center p-2 bg-teal-50 rounded-lg">
                  <p className="text-lg font-bold text-teal-900">
                    {safeNumber(user.tasksCompleted)}
                  </p>
                  <p className="text-xs text-teal-600">Tasks</p>
                </div>
                <div className="text-center p-2 bg-teal-50 rounded-lg">
                  <p className="text-lg font-bold text-teal-900">
                    {safeNumber(user.referralCount?.total)}
                  </p>
                  <p className="text-xs text-teal-600">Referrals</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <Card className="border-teal-200">
          <CardContent className="p-0">
            <TabsList className="grid w-full grid-cols-5 bg-white border-b border-teal-200 overflow-x-auto">
              <TabsTrigger
                value="personal"
                className="flex flex-col gap-1 p-2 xs:p-3 data-[state=active]:bg-teal-100 data-[state=active]:text-teal-700 min-w-[60px]"
              >
                <User className="h-4 w-4" />
                <span className="text-xs">Personal</span>
              </TabsTrigger>
              <TabsTrigger
                value="kyc"
                className="flex flex-col gap-1 p-2 xs:p-3 data-[state=active]:bg-teal-100 data-[state=active]:text-teal-700 min-w-[60px]"
              >
                <Shield className="h-4 w-4" />
                <span className="text-xs">KYC</span>
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="flex flex-col gap-1 p-2 xs:p-3 data-[state=active]:bg-teal-100 data-[state=active]:text-teal-700 min-w-[60px]"
              >
                <Wallet className="h-4 w-4" />
                <span className="text-xs">Wallet</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex flex-col gap-1 p-2 xs:p-3 data-[state=active]:bg-teal-100 data-[state=active]:text-teal-700 min-w-[60px]"
              >
                <Activity className="h-4 w-4" />
                <span className="text-xs">Activity</span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex flex-col gap-1 p-2 xs:p-3 data-[state=active]:bg-teal-100 data-[state=active]:text-teal-700 min-w-[60px]"
              >
                <Settings className="h-4 w-4" />
                <span className="text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        {/* Personal Information Tab */}
        <TabsContent value="personal" className="space-y-4 p-4 sm:p-6">
          <Card className="relative overflow-hidden border-teal-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-teal-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={isEditing ? editData.name || user.name : user.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="border-teal-200 focus:border-teal-500 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-teal-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={user.username}
                    disabled
                    className="bg-teal-50 border-teal-200 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-teal-700">
                    Email
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-teal-50 border-teal-200 w-full"
                    />
                    {user.isVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-teal-700">
                    Phone Number
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="phone"
                      value={
                        isEditing ? editData.phone || user.phone : user.phone
                      }
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      disabled={!isEditing}
                      className="border-teal-200 focus:border-teal-500 w-full"
                    />
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-teal-700">
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={
                      isEditing
                        ? editData.dateOfBirth || user.dateOfBirth
                        : user.dateOfBirth
                    }
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        dateOfBirth: e.target.value,
                      })
                    }
                    disabled={!isEditing}
                    className="border-teal-200 focus:border-teal-500 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joinDate" className="text-teal-700">
                    Join Date
                  </Label>
                  <Input
                    id="joinDate"
                    value={user.joinDate}
                    disabled
                    className="bg-teal-50 border-teal-200 w-full"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location" className="text-teal-700">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={
                      isEditing
                        ? editData.location || user.location || ""
                        : user.location || "Not specified"
                    }
                    onChange={(e) =>
                      setEditData({ ...editData, location: e.target.value })
                    }
                    disabled={!isEditing}
                    placeholder="Enter your location"
                    className="border-teal-200 focus:border-teal-500 w-full"
                  />
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-teal-700">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={
                    isEditing
                      ? editData.bio || user.bio || ""
                      : user.bio || "No bio added yet"
                  }
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="Tell us about yourself..."
                  className="border-teal-200 focus:border-teal-500 min-h-[80px] w-full"
                  maxLength={500}
                />
                {isEditing && (
                  <p className="text-xs text-teal-600">
                    {(editData.bio || user.bio || "").length}/500 characters
                  </p>
                )}
              </div>
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-teal-200 text-teal-700 hover:bg-teal-50 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* KYC Information Tab */}
        <TabsContent value="kyc" className="space-y-4 p-4 sm:p-6">
          <Card className="relative overflow-hidden border-teal-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <Shield className="h-5 w-5" />
                KYC Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-teal-800">
                    Verification Status
                  </p>
                  <p className="text-sm text-teal-600">
                    Complete KYC to unlock withdrawals
                  </p>
                </div>
                <Badge className={getKYCStatusColor(user.kycStatus)}>
                  {getKYCStatusText(user.kycStatus)}
                </Badge>
              </div>

              {user.kycStatus === "none" && (
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-amber-800 dark:text-amber-200">
                        KYC Verification Required
                      </p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        Pay ₹99 to start verification process
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 whitespace-nowrap mt-2 sm:mt-0"
                    >
                      Pay ₹99 & Verify
                    </Button>
                  </div>
                </div>
              )}

              {user.kycStatus === "rejected" && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-red-800 dark:text-red-200">
                        Account Suspended
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Pay ₹49 to reactivate your account
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="whitespace-nowrap mt-2 sm:mt-0"
                    >
                      Pay ₹49 & Reactivate
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700">Aadhaar Number</span>
                  <span className="text-sm text-teal-600">XXXX-XXXX-1234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-teal-700">PAN Number</span>
                  <span className="text-sm text-teal-600">ABCDE****F</span>
                </div>
                {user.kycPaidAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-teal-700">Payment Date</span>
                    <span className="text-sm text-teal-600">
                      {user.kycPaidAt}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet & Earnings Tab */}
        <TabsContent value="wallet" className="space-y-4 p-4 sm:p-6">
          <Card className="relative overflow-hidden border-teal-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
            <CardHeader className="relative">
              <CardTitle className="text-lg text-teal-800">
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="relative p-4 sm:p-6">
              <p className="text-2xl sm:text-3xl font-bold text-teal-900 text-center">
                ₹{safeNumber(user.walletBalance).toFixed(2)}
              </p>
              <p className="text-sm text-teal-600 mt-1 text-center">
                Available for withdrawal
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-teal-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
            <CardHeader className="relative">
              <CardTitle className="text-lg text-teal-800">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent className="relative p-4 sm:p-6">
              <p className="text-2xl sm:text-3xl font-bold text-green-600 text-center">
                ₹{safeNumber(user.totalEarnings).toFixed(2)}
              </p>
              <p className="text-sm text-teal-600 mt-1 text-center">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-teal-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <TrendingUp className="h-5 w-5" />
                Earnings Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative p-4 sm:p-6">
              <div className="flex justify-between items-center">
                <span className="text-teal-700">Referral Earnings</span>
                <span className="font-medium text-teal-900">
                  ₹{safeNumber(user.referralEarnings).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-teal-700">Task Earnings</span>
                <span className="font-medium text-teal-900">
                  ₹{safeNumber(user.taskEarnings).toFixed(2)}
                </span>
              </div>
              <hr className="border-teal-200" />
              <div className="flex justify-between items-center font-medium">
                <span className="text-teal-800">Withdrawable Balance</span>
                <span className="text-teal-900">
                  ₹{safeNumber(user.withdrawableBalance).toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  className="bg-teal-600 hover:bg-teal-700 w-full"
                  disabled={user.kycStatus !== "verified"}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Withdraw Funds
                </Button>
                <Button
                  variant="outline"
                  className="border-teal-200 text-teal-700 hover:bg-teal-50 w-full"
                  onClick={() => router.push("/wallet")}
                >
                  View History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Referral Information */}
          <Card className="relative overflow-hidden border-teal-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <Users className="h-5 w-5" />
                Referral Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative p-4 sm:p-6">
              <div className="space-y-3">
                <Label className="text-teal-700">Your Referral Code</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={user.referralCode}
                    disabled
                    className="bg-teal-50 border-teal-200 flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(user.referralCode)}
                    className="border-teal-200 text-teal-700 hover:bg-teal-100 whitespace-nowrap"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    <span className="hidden xs:inline">Copy</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-teal-700">Referral Link</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={generateReferralLink()}
                    disabled
                    className="bg-teal-50 border-teal-200 text-xs flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(generateReferralLink())}
                    className="border-teal-200 text-teal-700 hover:bg-teal-100 whitespace-nowrap"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    <span className="hidden xs:inline">Copy</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg">
                  <p className="text-xl font-bold text-teal-900">
                    {safeNumber(user.referralCount?.today)}
                  </p>
                  <p className="text-xs text-teal-600">Today</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg">
                  <p className="text-xl font-bold text-teal-900">
                    {safeNumber(user.referralCount?.total)}
                  </p>
                  <p className="text-xs text-teal-600">Total</p>
                </div>
              </div>

              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-teal-700">
                  How Referrals Work:
                </h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Share your referral link with friends</li>
                  <li>
                    • When they complete KYC verification (₹99), you earn ₹99
                  </li>
                  <li>• Weekly activity rules apply after KYC completion</li>
                </ul>
              </div>

              <Button
                variant="outline"
                className="w-full border-teal-200 text-teal-700 hover:bg-teal-100"
                onClick={() => router.push("/dashboard/user/referrals")}
              >
                View Referral Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity & Stats Tab */}
        <TabsContent value="activity" className="space-y-4 p-4 sm:p-6">
          <Card className="relative overflow-hidden border-teal-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <Activity className="h-5 w-5" />
                Task & Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <p className="text-xl font-bold text-green-700">
                    {safeNumber(user.tasksCompleted)}
                  </p>
                  <p className="text-xs text-green-600">Completed</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg">
                  <p className="text-xl font-bold text-yellow-700">
                    {safeNumber(user.pendingSubmissions)}
                  </p>
                  <p className="text-xs text-yellow-600">Pending</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-lg">
                  <p className="text-xl font-bold text-blue-700">
                    {safeNumber(user.approvedSubmissions)}
                  </p>
                  <p className="text-xs text-blue-600">Approved</p>
                </div>
                <div className="text-center p-3 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg">
                  <p className="text-xl font-bold text-red-700">
                    {safeNumber(user.rejectedSubmissions)}
                  </p>
                  <p className="text-xs text-red-600">Rejected</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-teal-800">
                    Weekly Progress
                  </span>
                  <span className="text-sm text-teal-600">
                    ₹{safeNumber(user.weeklyEarned)} / ₹
                    {safeNumber(user.weeklyGoal)}
                  </span>
                </div>
                <Progress
                  value={safeNumber(user.weeklyProgress)}
                  className="h-3"
                />
                <p className="text-xs text-teal-600">
                  Earn ≥ ₹1500 OR get 5 referrals/day to maintain account
                </p>
              </div>

              {safeNumber(user.suspensionCount) > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">
                      Suspension Count: {safeNumber(user.suspensionCount)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings & Security Tab */}
        <TabsContent value="settings" className="space-y-4 p-4 sm:p-6">
          <Card className="relative overflow-hidden border-teal-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <Key className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative p-4 sm:p-6">
              <div className="space-y-3">
                <Label htmlFor="currentPassword" className="text-teal-700">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                    className="border-teal-200 focus:border-teal-500 w-full"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 hover:bg-teal-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start border-teal-200 text-teal-700 hover:bg-teal-100 w-full"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-teal-200 text-teal-700 hover:bg-teal-100 w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="truncate">Enable 2FA (Coming Soon)</span>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-teal-200 text-teal-700 hover:bg-teal-100 w-full sm:col-span-2"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Active Sessions
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-teal-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-cyan-50 opacity-30"></div>
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-teal-800">
                <Bell className="h-5 w-5" />
                Notifications & Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative p-4 sm:p-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-teal-800">
                  Recent Notifications
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-teal-900 truncate">
                        Referral credited - ₹50
                      </p>
                      <p className="text-xs text-teal-600">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-teal-900 truncate">
                        Task approved - ₹25
                      </p>
                      <p className="text-xs text-teal-600">5 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="justify-start border-teal-200 text-teal-700 hover:bg-teal-100 w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support (WhatsApp)
                </Button>
                <Button
                  variant="outline"
                  className="justify-start border-teal-200 text-teal-700 hover:bg-teal-100 w-full"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & FAQ
                </Button>
              </div>

              <div className="pt-4 border-t border-teal-200">
                <Button variant="destructive" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UserProfilePage;
