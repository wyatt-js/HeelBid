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
import { Upload } from "lucide-react";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const formSchema = z.object({
  name: z.string().min(2, {
    message: "",
  }),
  description: z.string().min(2, {
    message: "",
  }),
  price: z.coerce.number(),
  starttime: z.string().regex(timeRegex, {
    message: "Time must be in HH:mm format (e.g., 09:30, 14:00)",
  }),
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
      starttime: "",
      duration: undefined,
      image: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createSupabaseComponentClient();
    try {
      const file: File = values.image;
      const filePath = `${Date.now()}-${file.name}`;

      let state = "";
      const currentTime = new Date();
      const currentHHMM = `${currentTime
        .getHours()
        .toString()
        .padStart(2, "0")}:${currentTime
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      const startTime = values.starttime;
      if (startTime > currentHHMM) {
        state = "future";
      } else {
        state = "ongoing";
      }

      console.log(file.name);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("auction-images")
        .upload(filePath, file, { contentType: file.type });
      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return;
      } else {
        console.log("Upload success:", uploadData);
      }

      const { data: insertData, error: insertError } = await supabase
        .from("auction_item")
        .insert([
          {
            seller_id: id.id,
            name: values.name,
            description: values.description,
            price: values.price,
            start_time: values.starttime,
            duration: values.duration,
            state: state,
            image_url: filePath,
          },
        ]);
      if (insertError) {
        console.error("Insert error:", insertError.message);
      } else {
        console.log("Success:", insertData);
        if (state === "ongoing") {
          router.push("/auctions/ongoing");
        } else if (state === "future") {
          router.push("/auctions/future");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      console.log(values);
    }
  }

  return (
    <div className="w-full h-full bg-card text-card-foreground border border-border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-8 p-8">
            <div className="flex flex-col justify-center mb-17">
              <h1 className="text-3xl font-bold mb-2">Create an Auction</h1>
              <p>Complete the details below</p>
            </div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-1 font-bold">Name</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full top-5 h-10"
                      placeholder="Name of the item you are listing"
                      {...field}
                    />
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
                  <FormLabel className="mb-1 font-bold">Description</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full h-10"
                      placeholder="Description of the item you are listing"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex">
            <div className="space-y-8 p-8 w-1/2 pt-0">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-1 font-bold">Price</FormLabel>
                    <FormControl>
                      <div className="relative w-full">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                          $
                        </span>
                        <Input
                          type="number"
                          className="pl-7 h-10"
                          placeholder="0.00"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="starttime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-1 font-bold">Start Time</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full h-10"
                        placeholder="Enter Start Time"
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
                    <FormLabel className="mb-1 font-bold">
                      Duration &#40;in minutes&#41;
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full h-10"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-1/2 pr-8">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-1 font-bold">Image</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        className="w-full h-10 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                          }
                        }}
                      />
                    </FormControl>
                    <div
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        form.setValue("image", file);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      className="border-dashed border-2 border-secondary rounded-lg w-full h-[200px] flex items-center justify-center transition-colors"
                    >
                      <Upload className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-500 text-sm dark:text-gray-400">
                        Drag and drop your files here
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex justify-between items-center p-8">
            <Button
              onClick={(e) => {
                e.preventDefault();
                form.reset();
              }}
              variant="destructive"
              className="w-1/8"
            >
              Reset
            </Button>
            <Button type="submit" className="w-1/8 bg-primary">
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
