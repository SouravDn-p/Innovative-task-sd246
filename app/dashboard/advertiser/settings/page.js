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
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdvertiserSettings() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // State for different settings sections
  const [generalSettings, setGeneralSettings] = useState({
    companyName: "My Company",
    contactEmail: session?.user?.email || "",
    contactPhone: "",
    website: "",
    timezone: "Asia/Kolkata",
    currency: "INR",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    campaignAlerts: true,
    budgetAlerts: true,
    performanceAlerts: true,
    paymentAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  const [billingSettings, setBillingSettings] = useState({
    paymentMethod: "bank_transfer",
    autoTopup: false,
    topupAmount: 1000,
    lowBalanceAlert: 500,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    primaryColor: "#0d9488",
    compactMode: false,
  });

  const [campaignSettings, setCampaignSettings] = useState({
    defaultBudget: 1000,
    defaultDuration: 7,
    autoApproveSubmissions: false,
    requireProof: true,
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Settings Saved",
        description: "Your advertiser settings have been updated successfully.",
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
      companyName: "My Company",
      contactEmail: session?.user?.email || "",
      contactPhone: "",
      website: "",
      timezone: "Asia/Kolkata",
      currency: "INR",
    });

    setNotificationSettings({
      emailNotifications: true,
      pushNotifications: true,
      campaignAlerts: true,
      budgetAlerts: true,
      performanceAlerts: true,
      paymentAlerts: true,
    });

    setSecuritySettings({
      twoFactorAuth: true,
      loginAlerts: true,
      sessionTimeout: 30,
    });

    setBillingSettings({
      paymentMethod: "bank_transfer",
      autoTopup: false,
      topupAmount: 1000,
      lowBalanceAlert: 500,
    });

    setAppearanceSettings({
      theme: "light",
      primaryColor: "#0d9488",
      compactMode: false,
    });

    setCampaignSettings({
      defaultBudget: 1000,
      defaultDuration: 7,
      autoApproveSubmissions: false,
      requireProof: true,
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
              Advertiser Settings
            </h1>
            <p className="text-teal-600">
              Manage your advertiser account settings and preferences
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
              <Settings className="h-4 w-4" />
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
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure your advertiser account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={generalSettings.companyName}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          companyName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          contactEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      value={generalSettings.contactPhone}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          contactPhone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={generalSettings.website}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          website: e.target.value,
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
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                      id="currency"
                      value={generalSettings.currency}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          currency: e.target.value,
                        })
                      }
                    />
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
                        <Label>Campaign Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify about campaign performance
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.campaignAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            campaignAlerts: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Budget Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify when budgets are low
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.budgetAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            budgetAlerts: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Performance Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify about significant performance changes
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.performanceAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            performanceAlerts: checked,
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

          {/* Billing Settings */}
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing Settings
                </CardTitle>
                <CardDescription>
                  Configure payment and billing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <select
                      id="paymentMethod"
                      className="w-full p-2 border rounded-md"
                      value={billingSettings.paymentMethod}
                      onChange={(e) =>
                        setBillingSettings({
                          ...billingSettings,
                          paymentMethod: e.target.value,
                        })
                      }
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Top-up</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically add funds when balance is low
                      </p>
                    </div>
                    <Switch
                      checked={billingSettings.autoTopup}
                      onCheckedChange={(checked) =>
                        setBillingSettings({
                          ...billingSettings,
                          autoTopup: checked,
                        })
                      }
                    />
                  </div>

                  {billingSettings.autoTopup && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="topupAmount">Top-up Amount (₹)</Label>
                        <Input
                          id="topupAmount"
                          type="number"
                          value={billingSettings.topupAmount}
                          onChange={(e) =>
                            setBillingSettings({
                              ...billingSettings,
                              topupAmount: parseFloat(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lowBalanceAlert">
                          Low Balance Alert (₹)
                        </Label>
                        <Input
                          id="lowBalanceAlert"
                          type="number"
                          value={billingSettings.lowBalanceAlert}
                          onChange={(e) =>
                            setBillingSettings({
                              ...billingSettings,
                              lowBalanceAlert: parseFloat(e.target.value) || 0,
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

          {/* Campaign Settings */}
          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Campaign Settings
                </CardTitle>
                <CardDescription>
                  Configure default campaign parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultBudget">Default Budget (₹)</Label>
                    <Input
                      id="defaultBudget"
                      type="number"
                      value={campaignSettings.defaultBudget}
                      onChange={(e) =>
                        setCampaignSettings({
                          ...campaignSettings,
                          defaultBudget: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultDuration">
                      Default Duration (days)
                    </Label>
                    <Input
                      id="defaultDuration"
                      type="number"
                      value={campaignSettings.defaultDuration}
                      onChange={(e) =>
                        setCampaignSettings({
                          ...campaignSettings,
                          defaultDuration: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-Approve Submissions</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically approve valid task submissions
                        </p>
                      </div>
                      <Switch
                        checked={campaignSettings.autoApproveSubmissions}
                        onCheckedChange={(checked) =>
                          setCampaignSettings({
                            ...campaignSettings,
                            autoApproveSubmissions: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Proof</Label>
                        <p className="text-sm text-muted-foreground">
                          Require users to submit proof for tasks
                        </p>
                      </div>
                      <Switch
                        checked={campaignSettings.requireProof}
                        onCheckedChange={(checked) =>
                          setCampaignSettings({
                            ...campaignSettings,
                            requireProof: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
