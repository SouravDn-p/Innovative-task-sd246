"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, X, DollarSign, Target, Users, Eye, EyeOff } from "lucide-react"

export function CreateCampaign() {
  const [currentStep, setCurrentStep] = useState(1)
  const [previewMode, setPreviewMode] = useState(false)
  const [campaignData, setCampaignData] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    requirements: [],
    budget: "",
    costPerTask: "",
    maxCompletions: "",
    targetAudience: {
      ageRange: "",
      gender: "",
      location: "",
    },
    schedule: {
      startDate: "",
      endDate: "",
      timezone: "",
    },
    proofRequirements: [],
  })

  const taskTypes = [
    { value: "social_media", label: "Social Media", description: "Instagram, Facebook, Twitter engagement" },
    { value: "app_store", label: "App Store", description: "App downloads and reviews" },
    { value: "video", label: "Video", description: "YouTube, TikTok engagement" },
    { value: "survey", label: "Survey", description: "Feedback and questionnaires" },
    { value: "website", label: "Website", description: "Website visits and actions" },
  ]

  const proofOptions = [
    "Screenshot of completion",
    "Link to profile/post",
    "Video proof",
    "Receipt/confirmation",
    "Survey response",
    "Custom requirement",
  ]

  const handleInputChange = (field, value) => {
    setCampaignData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNestedInputChange = (parent, field, value) => {
    setCampaignData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
  }

  const addRequirement = () => {
    setCampaignData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }))
  }

  const updateRequirement = (index, value) => {
    setCampaignData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => (i === index ? value : req)),
    }))
  }

  const removeRequirement = (index) => {
    setCampaignData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }))
  }

  const toggleProofRequirement = (requirement) => {
    setCampaignData((prev) => ({
      ...prev,
      proofRequirements: prev.proofRequirements.includes(requirement)
        ? prev.proofRequirements.filter((req) => req !== requirement)
        : [...prev.proofRequirements, requirement],
    }))
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Campaign created:", campaignData)
  }

  const togglePreview = () => {
    setPreviewMode(!previewMode)
  }

  const renderUserPreview = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Task Preview</h2>
          <p className="text-muted-foreground">How users will see this task</p>
        </div>

        {/* User Task Card Preview */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-lg">{campaignData.title || "Campaign Title"}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{campaignData.type || "Task Type"}</Badge>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ₹{campaignData.costPerTask || "0"} per task
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Remaining</div>
                <div className="font-semibold">{campaignData.maxCompletions || "0"}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {campaignData.description || "Task description will appear here..."}
              </p>
            </div>

            {campaignData.requirements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Requirements</h4>
                <ul className="space-y-1">
                  {campaignData.requirements.map((req, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {campaignData.proofRequirements.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Proof Required</h4>
                <div className="flex flex-wrap gap-1">
                  {campaignData.proofRequirements.map((req) => (
                    <Badge key={req} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button className="flex-1">Start Task</Button>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Target Audience Preview */}
        {(campaignData.targetAudience.ageRange ||
          campaignData.targetAudience.gender ||
          campaignData.targetAudience.location) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Target Audience</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Age Range</div>
                  <div className="font-medium">{campaignData.targetAudience.ageRange || "All"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Gender</div>
                  <div className="font-medium">{campaignData.targetAudience.gender || "All"}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Location</div>
                  <div className="font-medium">{campaignData.targetAudience.location || "Worldwide"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campaign Stats Preview */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {campaignData.budget && campaignData.costPerTask
                    ? Math.floor(campaignData.budget / campaignData.costPerTask)
                    : "0"}
                </div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">₹{campaignData.budget || "0"}</div>
                <div className="text-sm text-muted-foreground">Total Reward</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">₹{campaignData.costPerTask || "0"}</div>
                <div className="text-sm text-muted-foreground">Per Task</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderStepContent = () => {
    if (previewMode) {
      return renderUserPreview()
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                placeholder="e.g., Follow our Instagram account"
                value={campaignData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Campaign Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what users need to do..."
                value={campaignData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Task Type</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {taskTypes.map((type) => (
                  <Card
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      campaignData.type === type.value ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => handleInputChange("type", type.value)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold">{type.label}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Task Requirements</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Requirement
                </Button>
              </div>
              {campaignData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="e.g., Follow @username on Instagram"
                    value={requirement}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => removeRequirement(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget (₹)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="5000"
                  value={campaignData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="costPerTask">Cost Per Task (₹)</Label>
                <Input
                  id="costPerTask"
                  type="number"
                  placeholder="25"
                  value={campaignData.costPerTask}
                  onChange={(e) => handleInputChange("costPerTask", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxCompletions">Max Completions</Label>
                <Input
                  id="maxCompletions"
                  type="number"
                  placeholder="200"
                  value={campaignData.maxCompletions}
                  onChange={(e) => handleInputChange("maxCompletions", e.target.value)}
                  required
                />
              </div>
            </div>

            {campaignData.budget && campaignData.costPerTask && (
              <Card className="bg-muted">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        {Math.floor(campaignData.budget / campaignData.costPerTask)}
                      </div>
                      <div className="text-sm text-muted-foreground">Estimated Completions</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">₹{campaignData.budget}</div>
                      <div className="text-sm text-muted-foreground">Total Budget</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-500">₹{campaignData.costPerTask}</div>
                      <div className="text-sm text-muted-foreground">Per Task</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <Label>Target Audience</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageRange">Age Range</Label>
                  <Select
                    value={campaignData.targetAudience.ageRange}
                    onValueChange={(value) => handleNestedInputChange("targetAudience", "ageRange", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18-24">18-24</SelectItem>
                      <SelectItem value="25-34">25-34</SelectItem>
                      <SelectItem value="35-44">35-44</SelectItem>
                      <SelectItem value="45+">45+</SelectItem>
                      <SelectItem value="all">All Ages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={campaignData.targetAudience.gender}
                    onValueChange={(value) => handleNestedInputChange("targetAudience", "gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., India, Mumbai"
                    value={campaignData.targetAudience.location}
                    onChange={(e) => handleNestedInputChange("targetAudience", "location", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Proof Requirements</Label>
              <p className="text-sm text-muted-foreground">
                Select what users need to provide as proof of task completion
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {proofOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={campaignData.proofRequirements.includes(option)}
                      onCheckedChange={() => toggleProofRequirement(option)}
                    />
                    <Label htmlFor={option} className="text-sm">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Campaign Schedule</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={campaignData.schedule.startDate}
                    onChange={(e) => handleNestedInputChange("schedule", "startDate", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={campaignData.schedule.endDate}
                    onChange={(e) => handleNestedInputChange("schedule", "endDate", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Card className="bg-muted">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Selected Proof Requirements:</h3>
                <div className="flex flex-wrap gap-2">
                  {campaignData.proofRequirements.map((req) => (
                    <Badge key={req} variant="secondary">
                      {req}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Review Your Campaign</h2>
              <p className="text-muted-foreground">Please review all details before launching</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Campaign Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="font-medium">{campaignData.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground">{campaignData.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Type</Label>
                      <Badge>{campaignData.type}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Target Audience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <Label className="text-sm font-medium">Age</Label>
                        <p className="text-sm">{campaignData.targetAudience.ageRange || "All"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Gender</Label>
                        <p className="text-sm">{campaignData.targetAudience.gender || "All"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Location</Label>
                        <p className="text-sm">{campaignData.targetAudience.location || "Worldwide"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Budget & Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Total Budget</Label>
                          <p className="text-xl font-bold text-primary">₹{campaignData.budget}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Cost Per Task</Label>
                          <p className="text-xl font-bold text-green-500">₹{campaignData.costPerTask}</p>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-accent">
                          {Math.floor(campaignData.budget / campaignData.costPerTask)}
                        </div>
                        <div className="text-sm text-muted-foreground">Estimated Completions</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements & Proof</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Task Requirements</Label>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {campaignData.requirements.map((req, index) => (
                          <li key={index} className="text-sm">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Proof Requirements</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {campaignData.proofRequirements.map((req) => (
                          <Badge key={req} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {(campaignData.schedule.startDate || campaignData.schedule.endDate) && (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Start Date</Label>
                      <p>{campaignData.schedule.startDate || "Immediate"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">End Date</Label>
                      <p>{campaignData.schedule.endDate || "No end date"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Create Campaign</h1>
              <p className="text-sm text-muted-foreground">
                {previewMode ? "Preview Mode" : `Step ${currentStep} of 4`}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
            className="flex items-center gap-2 bg-transparent"
          >
            {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? "Exit Preview" : "Preview"}
          </Button>
        </div>
      </header>

      {/* Progress Bar */}
      {!previewMode && (
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{currentStep}/4</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="p-6">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              {!previewMode && (
                <div className="flex justify-between mt-8">
                  <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
                    Previous
                  </Button>
                  {currentStep < 4 ? (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      Launch Campaign
                    </Button>
                  )}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
