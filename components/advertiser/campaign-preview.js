"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Share2, Edit, Play, Pause } from "lucide-react"

export function CampaignPreview({ campaign, onEdit, onToggleStatus }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaign Preview</h2>
          <p className="text-muted-foreground">Live preview of your campaign</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant={campaign.status === "active" ? "destructive" : "default"} size="sm" onClick={onToggleStatus}>
            {campaign.status === "active" ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Live Campaign Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl">{campaign.title}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{campaign.type}</Badge>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  ₹{campaign.costPerTask} per task
                </Badge>
                <Badge variant={campaign.status === "active" ? "default" : "secondary"}>{campaign.status}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Remaining</div>
              <div className="font-semibold">{campaign.remainingTasks}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{campaign.description}</p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Requirements</h4>
            <ul className="space-y-1">
              {campaign.requirements.map((req, index) => (
                <li key={index} className="text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Proof Required</h4>
            <div className="flex flex-wrap gap-1">
              {campaign.proofRequirements.map((req) => (
                <Badge key={req} variant="outline" className="text-xs">
                  {req}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" disabled={campaign.status !== "active"}>
              Start Task
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{campaign.completions}</div>
            <div className="text-sm text-muted-foreground">Completions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">{campaign.views}</div>
            <div className="text-sm text-muted-foreground">Views</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {((campaign.completions / campaign.views) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Conversion</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">₹{campaign.spent}</div>
            <div className="text-sm text-muted-foreground">Spent</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
