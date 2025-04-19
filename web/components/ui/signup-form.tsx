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

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().min(2, {
    message: "Email must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
});

export function SignupForm() {
  const supabase = createSupabaseComponentClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await supabase.auth
      .signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { display_name: values.username, username: values.username },
        },
      })
      .then(({ error }) => {
        if (error) {
          console.log("Error signing up:", error);
        } else {
          router.push("/");
        }
      });
  }

  return (
    <div className="flex justify-center items-center flex-col h-screen bg-background">
      <div className="w-1/3 h-2/3 rounded-lg shadow-accent bg-card text-card-foreground border border-border">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 p-8"
          >
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold mb-2">HeelBid Sign up</h1>
              <p>
                Specify you&apos;re account here. Click Sign Up when you&apos;re
                done.
              </p>
            </div>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="mb-1 font-bold">Username</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full top-5 h-10"
                      placeholder="ramses"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="mb-1 font-bold">Email</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full top-5 h-10"
                      placeholder="ramses@ad.unc.edu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="mb-1 font-bold">Password</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full h-10"
                      placeholder="********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="bg-primary">
              Sign Up
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
