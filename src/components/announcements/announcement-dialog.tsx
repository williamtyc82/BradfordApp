import { useState, useEffect } from "react"
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
import { PlusCircle, Loader2, Pencil } from "lucide-react"
import { useFirebase } from "@/firebase"
import { collection, addDoc, doc, updateDoc } from "firebase/firestore"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { Announcement } from "@/lib/types"

interface AnnouncementDialogProps {
  announcement?: Announcement;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AnnouncementDialog({ announcement, trigger, open: controlledOpen, onOpenChange }: AnnouncementDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState<"Normal" | "Important" | "Urgent">("Normal")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { firestore } = useFirebase()
  const { user } = useAuth()
  const { toast } = useToast()

  const isEditing = !!announcement;

  useEffect(() => {
    if (announcement && open) {
      setTitle(announcement.title)
      setContent(announcement.content)
      setPriority(announcement.priority)
    } else if (!open && !announcement) {
      // Reset on close only if creating
      setTitle("")
      setContent("")
      setPriority("Normal")
    }
  }, [announcement, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firestore || !user) return

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditing && announcement) {
        await updateDoc(doc(firestore, "announcements", announcement.id), {
          title,
          content,
          priority,
          // Do not update postedBy or postedAt
        })
        toast({
          title: "Success",
          description: "Announcement updated successfully."
        })
      } else {
        await addDoc(collection(firestore, "announcements"), {
          title,
          content,
          priority,
          postedBy: user.id,
          postedAt: new Date().toISOString()
        })
        toast({
          title: "Success",
          description: "Announcement posted successfully."
        })
      }

      if (setOpen) setOpen(false);

      if (!isEditing) {
        setTitle("")
        setContent("")
        setPriority("Normal")
      }
    } catch (error) {
      console.error("Error saving announcement:", error)
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'post'} announcement. Please try again.`,
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : !isEditing ? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Announcement
          </Button>
        ) : null}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Announcement" : "Create New Announcement"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the details of this announcement." : "Post an update that will be visible to all workers."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                className="col-span-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Upcoming System Maintenance"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Content
              </Label>
              <Textarea
                id="content"
                className="col-span-3"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter the detailed announcement text here..."
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">
                Priority
              </Label>
              <Select
                value={priority}
                onValueChange={(value: "Normal" | "Important" | "Urgent") => setPriority(value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Important">Important</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Post Announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
