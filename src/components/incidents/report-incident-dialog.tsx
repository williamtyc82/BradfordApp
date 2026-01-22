"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Textarea } from "../ui/textarea"
import { PlusCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import React from "react"

export function ReportIncidentDialog({ triggerButton }: { triggerButton?: React.ReactNode }) {
  const { user } = useAuth()
  const defaultTrigger = (
    <Button>
        <PlusCircle className="mr-2 h-4 w-4" />
        Report New Incident
    </Button>
  )

  if (user?.role !== 'worker' && !triggerButton) return null
  if (user?.role === 'manager' && triggerButton) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Incident
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                <DialogTitle>Create New Incident Report</DialogTitle>
                <DialogDescription>
                    Manually create an incident report.
                </DialogDescription>
                </DialogHeader>
                <IncidentForm />
            </DialogContent>
        </Dialog>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Report New Incident</DialogTitle>
          <DialogDescription>
            Fill out the form below to report a new incident. Provide as much detail as possible.
          </DialogDescription>
        </DialogHeader>
        <IncidentForm />
      </DialogContent>
    </Dialog>
  )
}

function IncidentForm() {
    return (
        <>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                Title
                </Label>
                <Input id="title" placeholder="e.g. Forklift malfunction" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                    Category
                </Label>
                <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="logistics">Logistics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="severity" className="text-right">
                    Severity
                </Label>
                <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                Location
                </Label>
                <Input id="location" placeholder="e.g. Warehouse B, Aisle 3" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                Description
                </Label>
                <Textarea id="description" placeholder="Describe the incident..." className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="media" className="text-right">
                Media
                </Label>
                <Input id="media" type="file" multiple className="col-span-3" />
            </div>
            </div>
            <DialogFooter>
            <Button type="submit">Submit Report</Button>
            </DialogFooter>
        </>
    )
}
