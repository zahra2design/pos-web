import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import { loginSchema, type LoginFormData } from "../types/auth.types";
import { Coffee, Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Login gagal";
      // Map common Supabase errors to Indonesian
      if (message.includes("Invalid login credentials")) {
        setError("Email atau password salah");
      } else if (message.includes("Email not confirmed")) {
        setError(
          "Email belum dikonfirmasi. Silakan cek inbox atau nonaktifkan email confirmation di Supabase Dashboard > Authentication > Settings"
        );
      } else if (message.includes("Too many requests")) {
        setError("Terlalu banyak percobaan. Silakan tunggu beberapa saat.");
      } else {
        setError(message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="w-full max-w-sm rounded-lg border bg-background p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Coffee className="h-10 w-10" />
          <h1 className="text-2xl font-bold">CafePOS</h1>
          <p className="text-sm text-muted-foreground">
            Masuk ke akun Anda
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                autoComplete="current-password"
                className="w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" />
              Ingat saya
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Lupa password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <div className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <p className="font-medium mb-1">Demo Credentials:</p>
          <p>Email: owner@cafepos.com</p>
          <p>Password: Owner123!</p>
        </div>
      </div>
    </div>
  );
}
