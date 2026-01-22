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
import { PlusCircle, Trash2 } from "lucide-react"

export function CreateQuizDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Quiz
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Quiz</DialogTitle>
          <DialogDescription>
            Build a new quiz for your team. Add questions and define correct answers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label htmlFor="quiz-title">Quiz Title</Label>
                <Input id="quiz-title" placeholder="e.g., Advanced Safety Protocols" />
            </div>
            {/* A sample question */}
            <div className="space-y-4 rounded-lg border p-4">
                <div className="flex justify-between items-center">
                    <Label className="font-semibold">Question 1</Label>
                    <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
                <Input placeholder="What is the primary safety color?" />
                <div className="space-y-2 pl-4">
                    <Input placeholder="Option 1" />
                    <Input placeholder="Option 2" />
                    <Input placeholder="Option 3 (Correct)" />
                    <Input placeholder="Option 4" />
                </div>
            </div>
            <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Question
            </Button>
        </div>
        <DialogFooter>
          <Button type="submit">Save Quiz</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
