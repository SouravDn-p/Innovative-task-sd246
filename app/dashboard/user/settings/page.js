"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Mail,
  Globe,
  User,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function UserSettings() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // State for different settings sections
  const [generalSettings, setGeneralSettings] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    timezone: "Asia/Kolkata",
    language: "en",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskAlerts: true,
    paymentAlerts: true,
    referralAlerts: true,
    promotionAlerts: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    taskHistoryVisibility: "friends",
    earningsVisibility: "private",
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    primaryColor: "#0d9488",
    compactMode: false,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    preferredPaymentMethod: "bank_transfer",
    autoWithdrawal: false,
    withdrawalThreshold: 500,
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Settings Saved",
        description: "Your user settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    // Reset to default values
    setGeneralSettings({
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
      timezone: "Asia/Kolkata",
      language: "en",
    });

    setNotificationSettings({
      emailNotifications: true,
      pushNotifications: true,
      taskAlerts: true,
      paymentAlerts: true,
      referralAlerts: true,
      promotionAlerts: false,
    });

    setSecuritySettings({
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: 30,
    });

    setPrivacySettings({
      profileVisibility: "public",
      taskHistoryVisibility: "friends",
      earningsVisibility: "private",
    });

    setAppearanceSettings({
      theme: "light",
      primaryColor: "#0d9488",
      compactMode: false,
    });

    setPaymentSettings({
      preferredPaymentMethod: "bank_transfer",
      autoWithdrawal: false,
      withdrawalThreshold: 500,
    });

    toast({
      title: "Settings Reset",
      description: "Settings have been reset to default values.",
    });
  };

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

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-teal-900 flex items-center gap-2">
              <Settings className="h-6 w-6" />
              User Settings
            </h1>
            <p className="text-teal-600">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={generalSettings.name}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={generalSettings.email}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={generalSettings.phone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      value={generalSettings.timezone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          timezone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <select
                      id="language"
                      className="w-full p-2 border rounded-md"
                      value={generalSettings.language}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          language: e.target.value,
                        })
                      }
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="ta">Tamil</option>
                      <option value="te">Telugu</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          pushNotifications: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Alert Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Task Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify about task updates and deadlines
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.taskAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            taskAlerts: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Payment Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify when payments are processed
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.paymentAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            paymentAlerts: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Referral Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify about referral bonuses
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.referralAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            referralAlerts: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Promotional Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify about special offers and promotions
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.promotionAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            promotionAlerts: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure account security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for account access
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          twoFactorAuth: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Send alerts for new login attempts
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.loginAlerts}
                      onCheckedChange={(checked) =>
                        setSecuritySettings({
                          ...securitySettings,
                          loginAlerts: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Session Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">
                        Session Timeout (minutes)
                      </Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            sessionTimeout: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control who can see your information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileVisibility">
                      Profile Visibility
                    </Label>
                    <select
                      id="profileVisibility"
                      className="w-full p-2 border rounded-md mt-2"
                      value={privacySettings.profileVisibility}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          profileVisibility: e.target.value,
                        })
                      }
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Control who can view your profile information
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="taskHistoryVisibility">
                      Task History Visibility
                    </Label>
                    <select
                      id="taskHistoryVisibility"
                      className="w-full p-2 border rounded-md mt-2"
                      value={privacySettings.taskHistoryVisibility}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          taskHistoryVisibility: e.target.value,
                        })
                      }
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Control who can view your task completion history
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="earningsVisibility">
                      Earnings Visibility
                    </Label>
                    <select
                      id="earningsVisibility"
                      className="w-full p-2 border rounded-md mt-2"
                      value={privacySettings.earningsVisibility}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          earningsVisibility: e.target.value,
                        })
                      }
                    >
                      <option value="public">Public</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private</option>
                    </select>
                    <p className="text-sm text-muted-foreground mt-1">
                      Control who can view your earnings information
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance Settings
                </CardTitle>
                <CardDescription>
                  Customize the dashboard appearance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      id="theme"
                      className="w-full p-2 border rounded-md"
                      value={appearanceSettings.theme}
                      onChange={(e) =>
                        setAppearanceSettings({
                          ...appearanceSettings,
                          theme: e.target.value,
                        })
                      }
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        id="primaryColor"
                        type="color"
                        className="w-12 h-12 border-0 rounded cursor-pointer"
                        value={appearanceSettings.primaryColor}
                        onChange={(e) =>
                          setAppearanceSettings({
                            ...appearanceSettings,
                            primaryColor: e.target.value,
                          })
                        }
                      />
                      <Input
                        value={appearanceSettings.primaryColor}
                        onChange={(e) =>
                          setAppearanceSettings({
                            ...appearanceSettings,
                            primaryColor: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compact Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Use compact layout for tables and lists
                      </p>
                    </div>
                    <Switch
                      checked={appearanceSettings.compactMode}
                      onCheckedChange={(checked) =>
                        setAppearanceSettings({
                          ...appearanceSettings,
                          compactMode: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Settings
                </CardTitle>
                <CardDescription>
                  Configure payment and withdrawal preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="preferredPaymentMethod">
                      Preferred Payment Method
                    </Label>
                    <select
                      id="preferredPaymentMethod"
                      className="w-full p-2 border rounded-md"
                      value={paymentSettings.preferredPaymentMethod}
                      onChange={(e) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          preferredPaymentMethod: e.target.value,
                        })
                      }
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Withdrawal</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically withdraw when balance reaches threshold
                      </p>
                    </div>
                    <Switch
                      checked={paymentSettings.autoWithdrawal}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          autoWithdrawal: checked,
                        })
                      }
                    />
                  </div>

                  {paymentSettings.autoWithdrawal && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdrawalThreshold">
                          Withdrawal Threshold (₹)
                        </Label>
                        <Input
                          id="withdrawalThreshold"
                          type="number"
                          value={paymentSettings.withdrawalThreshold}
                          onChange={(e) =>
                            setPaymentSettings({
                              ...paymentSettings,
                              withdrawalThreshold:
                                parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
