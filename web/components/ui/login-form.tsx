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
import Link from "next/link";
import { createSupabaseComponentClient } from "@/utils/supabase/create-browser-client";
import { useRouter } from "next/router";

const formSchema = z.object({
  email: z.string().min(2, {
    message: "Email must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const supabase = createSupabaseComponentClient();
    await supabase.auth
      .signInWithPassword({
        email: values.email,
        password: values.password,
      })
      .then(({ error }) => {
        if (error) {
          window.alert(error);
        } else {
          router.push("/");
        }
      });
  }

  return (
    <div className="flex justify-center items-center flex-col h-screen bg-background">
      <div className="w-1/3 h-3/5 rounded-lg shadow-accent bg-card text-card-foreground border border-border">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 p-8"
          >
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl font-bold mb-2">HeelBid Login</h1>
              <p>Enter your email below to login to your account</p>
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
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
                <FormItem>
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
            <Button type="submit" className="w-full bg-primary">
              Login
            </Button>
            <div className="flex justify-center items-center flex-col">
              <p>
                Don&apos;t have an account?{" "}
                <Link href={"/signup"}>
                  <u>Sign up</u>
                </Link>
              </p>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
