"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";
import { useFirebase } from "@/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { Quiz, QuizQuestion } from "@/lib/types";

const questionSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  options: z.array(z.string().min(1, "Option cannot be empty")).length(4),
  correctAnswer: z.number().min(0).max(3),
  points: z.number().min(1).default(10),
});

const quizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string({ required_error: "Please select a category" }),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  questions: z.array(questionSchema).min(1, "Quiz must have at least one question"),
});

type QuizFormData = z.infer<typeof quizSchema>;

interface CreateQuizDialogProps {
  quiz?: Quiz;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateQuizDialog({ quiz, open: openProp, onOpenChange: onOpenChangeProp }: CreateQuizDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEditing = !!quiz;
  const { firestore, storage } = useFirebase();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const { toast } = useToast();

  const open = openProp !== undefined ? openProp : internalOpen;
  const setOpen = onOpenChangeProp !== undefined ? onOpenChangeProp : setInternalOpen;

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      duration: 15,
      questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0, points: 10 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  useEffect(() => {
    if (quiz && open) {
      form.reset({
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        duration: quiz.duration,
        questions: quiz.questions,
      });
    } else if (!quiz && open) {
      form.reset({
        title: "",
        description: "",
        category: "",
        duration: 15,
        questions: [{ question: "", options: ["", "", "", ""], correctAnswer: 0, points: 10 }],
      });
    }
  }, [quiz, open, form]);

  const onSubmit = async (data: QuizFormData) => {
    if (!firestore || !user) return;

    setIsSubmitting(true);
    try {
      let coverImageUrl = quiz?.coverImage;

      if (coverImageFile && storage) {
        const storageRef = ref(storage, `quizzes/covers/${user.id}/${Date.now()}-${coverImageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, coverImageFile);
        coverImageUrl = await getDownloadURL(uploadResult.ref);
      }

      if (isEditing && quiz) {
        await updateDoc(doc(firestore, "quizzes", quiz.id), {
          ...data,
          coverImage: coverImageUrl || null,
          updatedAt: new Date().toISOString(),
        } as any);
        toast({
          title: "Success",
          description: "Quiz updated successfully",
        });
      } else {
        await addDoc(collection(firestore, "quizzes"), {
          ...data,
          coverImage: coverImageUrl || null,
          createdBy: user.id,
          createdAt: new Date().toISOString(),
        });
        toast({
          title: "Success",
          description: "Quiz created successfully",
        });
      }
      setOpen(false);
      setCoverImageFile(null);
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error",
        description: "Failed to save quiz",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditing && (
        <DialogTrigger asChild>
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Create Quiz</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{isEditing ? "Edit Quiz" : "Create New Quiz"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your quiz details and questions."
              : "Build a new assessment for your team. Define questions, options, and point values."
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiz Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Equipment Maintenance 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Safety">Safety</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Emergency">Emergency</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what this quiz covers..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>



              <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                <FormLabel className="text-sm font-medium">Cover Image (Optional)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImageFile(e.target.files?.[0] || null)}
                />
                <FormDescription className="text-xs">
                  Upload a cover image for the quiz card.
                </FormDescription>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Questions ({fields.length})</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ question: "", options: ["", "", "", ""], correctAnswer: 0, points: 10 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 rounded-xl border bg-muted/30 space-y-4 relative group">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-primary/70">Question {index + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`questions.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Enter your question here..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Options (Select correct answer)</FormLabel>
                      <FormField
                        control={form.control}
                        name={`questions.${index}.correctAnswer`}
                        render={({ field }) => (
                          <RadioGroup
                            onValueChange={(val) => field.onChange(parseInt(val))}
                            defaultValue={field.value.toString()}
                            value={field.value.toString()}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                          >
                            {[0, 1, 2, 3].map((optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2 bg-background p-2 rounded-lg border">
                                <RadioGroupItem value={optIndex.toString()} id={`q${index}-opt${optIndex}`} />
                                <FormField
                                  control={form.control}
                                  name={`questions.${index}.options.${optIndex}`}
                                  render={({ field: optField }) => (
                                    <FormControl>
                                      <Input
                                        {...optField}
                                        placeholder={`Option ${optIndex + 1}`}
                                        className="h-8 border-none p-0 focus-visible:ring-0"
                                      />
                                    </FormControl>
                                  )}
                                />
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <FormField
                        control={form.control}
                        name={`questions.${index}.points`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormLabel className="text-xs">Points:</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="w-16 h-8 text-center"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="p-6 border-t bg-muted/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditing ? "Update Quiz" : "Create Quiz"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog >
  );
}
