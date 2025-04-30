import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

const formSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  price: z.coerce.number(),
  startDate: z.date(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  duration: z.coerce.number(),
  image: z.any(),
});

export function CreateForm(id: { id: string }) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: undefined,
      startDate: new Date(),
      startTime: "",
      duration: undefined,
      image: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createSupabaseComponentClient();
    try {
      const file: File = values.image;
      const filePath = `${Date.now()}-${file.name}`;

      // Combine date and time into a single Date object
      const [hours, minutes] = values.startTime.split(":").map(Number);
      const startDateTime = new Date(values.startDate);
      startDateTime.setHours(hours);
      startDateTime.setMinutes(minutes);

      const now = new Date();
      const state = startDateTime > now ? "future" : "ongoing";

      const { error: uploadError } = await supabase.storage
        .from("auction-images")
        .upload(filePath, file, { contentType: file.type });
      if (uploadError) {
        toast.error("Upload failed");
        return;
      }

      const { error: insertError } = await supabase.from("auction_item").insert([
        {
          seller_id: id.id,
          name: values.name,
          description: values.description,
          price: values.price,
          start_time: startDateTime.toISOString(),
          duration: values.duration,
          state,
          image_url: filePath,
        },
      ]);

      if (insertError) {
        toast.error("Failed to create auction");
      } else {
        toast.success("Auction created successfully");
        router.push(`/auctions/${state}`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="w-full h-full bg-card text-card-foreground border border-border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8 p-8">
            <h1 className="text-3xl font-bold">Create an Auction</h1>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full text-left">
                          {field.value ? format(field.value, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g. 30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => field.onChange(e.target.files?.[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center pt-4">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  form.reset();
                }}
                variant="destructive"
              >
                Reset
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" /> Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}