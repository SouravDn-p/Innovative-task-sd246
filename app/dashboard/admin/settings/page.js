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
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Globe,
  Users,
  AlertTriangle,
  CheckCircle,
  Save,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminSettings() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // State for different settings sections
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "TaskEarn Platform",
    siteDescription: "Task-based earning platform",
    adminEmail: session?.user?.email || "",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24-hour",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newUserAlerts: true,
    taskSubmissionAlerts: true,
    paymentAlerts: true,
    systemAlerts: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    loginAlerts: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    failedLoginAttempts: 5,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "light",
    primaryColor: "#0d9488",
    sidebarCollapsed: false,
    compactMode: false,
  });

  const [kycSettings, setKycSettings] = useState({
    requireKyc: true,
    autoApproveKyc: false,
    kycFee: 99,
    documentTypes: ["aadhar", "pan", "selfie", "bankStatement"],
  });

  const [taskSettings, setTaskSettings] = useState({
    defaultCommission: 10,
    maxCommission: 25,
    minTaskAmount: 50,
    maxTaskAmount: 10000,
    autoApproveTasks: false,
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Settings Saved",
        description: "Your admin settings have been updated successfully.",
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
      siteName: "TaskEarn Platform",
      siteDescription: "Task-based earning platform",
      adminEmail: session?.user?.email || "",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24-hour",
    });

    setNotificationSettings({
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      newUserAlerts: true,
      taskSubmissionAlerts: true,
      paymentAlerts: true,
      systemAlerts: true,
    });

    setSecuritySettings({
      twoFactorAuth: true,
      loginAlerts: true,
      sessionTimeout: 30,
      passwordExpiry: 90,
      failedLoginAttempts: 5,
    });

    setAppearanceSettings({
      theme: "light",
      primaryColor: "#0d9488",
      sidebarCollapsed: false,
      compactMode: false,
    });

    setKycSettings({
      requireKyc: true,
      autoApproveKyc: false,
      kycFee: 99,
      documentTypes: ["aadhar", "pan", "selfie", "bankStatement"],
    });

    setTaskSettings({
      defaultCommission: 10,
      maxCommission: 25,
      minTaskAmount: 50,
      maxTaskAmount: 10000,
      autoApproveTasks: false,
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
              Admin Settings
            </h1>
            <p className="text-teal-600">
              Manage platform-wide settings and configurations
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
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="kyc" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">KYC</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
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
                  Configure basic platform settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          siteName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">Site Description</Label>
                    <Textarea
                      id="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          siteDescription: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">Admin Email</Label>
                    <Input
                      id="adminEmail"
                      type="email"
                      value={generalSettings.adminEmail}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          adminEmail: e.target.value,
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
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Input
                      id="dateFormat"
                      value={generalSettings.dateFormat}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          dateFormat: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <Input
                      id="timeFormat"
                      value={generalSettings.timeFormat}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          timeFormat: e.target.value,
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
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via SMS
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          smsNotifications: checked,
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
                        <Label>New User Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify when new users register
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.newUserAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            newUserAlerts: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Task Submission Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify when users submit tasks
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.taskSubmissionAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            taskSubmissionAlerts: checked,
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
                        <Label>System Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify about system issues or updates
                        </p>
                      </div>
                      <Switch
                        checked={notificationSettings.systemAlerts}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            systemAlerts: checked,
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
                  Configure platform security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for admin accounts
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
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">
                        Password Expiry (days)
                      </Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            passwordExpiry: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="failedLoginAttempts">
                        Failed Login Attempts
                      </Label>
                      <Input
                        id="failedLoginAttempts"
                        type="number"
                        value={securitySettings.failedLoginAttempts}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            failedLoginAttempts: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
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
                  Customize the platform&s look and feel
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
                  <h3 className="font-medium mb-4">Layout Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Sidebar Collapsed</Label>
                        <p className="text-sm text-muted-foreground">
                          Keep sidebar collapsed by default
                        </p>
                      </div>
                      <Switch
                        checked={appearanceSettings.sidebarCollapsed}
                        onCheckedChange={(checked) =>
                          setAppearanceSettings({
                            ...appearanceSettings,
                            sidebarCollapsed: checked,
                          })
                        }
                      />
                    </div>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Settings */}
          <TabsContent value="kyc">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  KYC Settings
                </CardTitle>
                <CardDescription>
                  Configure KYC verification requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require KYC</Label>
                      <p className="text-sm text-muted-foreground">
                        Require KYC verification for all users
                      </p>
                    </div>
                    <Switch
                      checked={kycSettings.requireKyc}
                      onCheckedChange={(checked) =>
                        setKycSettings({ ...kycSettings, requireKyc: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Approve KYC</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve valid KYC submissions
                      </p>
                    </div>
                    <Switch
                      checked={kycSettings.autoApproveKyc}
                      onCheckedChange={(checked) =>
                        setKycSettings({
                          ...kycSettings,
                          autoApproveKyc: checked,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">KYC Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="kycFee">KYC Fee (₹)</Label>
                      <Input
                        id="kycFee"
                        type="number"
                        value={kycSettings.kycFee}
                        onChange={(e) =>
                          setKycSettings({
                            ...kycSettings,
                            kycFee: parseFloat(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label>Required Document Types</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                      {["aadhar", "pan", "selfie", "bankStatement"].map(
                        (docType) => (
                          <div
                            key={docType}
                            className="flex items-center space-x-2"
                          >
                            <Switch
                              id={docType}
                              checked={kycSettings.documentTypes.includes(
                                docType
                              )}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setKycSettings({
                                    ...kycSettings,
                                    documentTypes: [
                                      ...kycSettings.documentTypes,
                                      docType,
                                    ],
                                  });
                                } else {
                                  setKycSettings({
                                    ...kycSettings,
                                    documentTypes:
                                      kycSettings.documentTypes.filter(
                                        (type) => type !== docType
                                      ),
                                  });
                                }
                              }}
                            />
                            <Label htmlFor={docType} className="capitalize">
                              {docType.replace(/([A-Z])/g, " $1").trim()}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Task Settings */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Task Settings
                </CardTitle>
                <CardDescription>
                  Configure task management parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCommission">
                      Default Commission (%)
                    </Label>
                    <Input
                      id="defaultCommission"
                      type="number"
                      value={taskSettings.defaultCommission}
                      onChange={(e) =>
                        setTaskSettings({
                          ...taskSettings,
                          defaultCommission: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxCommission">
                      Maximum Commission (%)
                    </Label>
                    <Input
                      id="maxCommission"
                      type="number"
                      value={taskSettings.maxCommission}
                      onChange={(e) =>
                        setTaskSettings({
                          ...taskSettings,
                          maxCommission: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minTaskAmount">
                      Minimum Task Amount (₹)
                    </Label>
                    <Input
                      id="minTaskAmount"
                      type="number"
                      value={taskSettings.minTaskAmount}
                      onChange={(e) =>
                        setTaskSettings({
                          ...taskSettings,
                          minTaskAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTaskAmount">
                      Maximum Task Amount (₹)
                    </Label>
                    <Input
                      id="maxTaskAmount"
                      type="number"
                      value={taskSettings.maxTaskAmount}
                      onChange={(e) =>
                        setTaskSettings({
                          ...taskSettings,
                          maxTaskAmount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Approve Tasks</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically approve valid task submissions
                      </p>
                    </div>
                    <Switch
                      checked={taskSettings.autoApproveTasks}
                      onCheckedChange={(checked) =>
                        setTaskSettings({
                          ...taskSettings,
                          autoApproveTasks: checked,
                        })
                      }
                    />
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
