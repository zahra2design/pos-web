import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../hooks/useAuth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "../types/auth.types";
import { Coffee, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router";

export function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal mengirim email";
      setError(message);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/50">
        <div className="w-full max-w-sm rounded-lg border bg-background p-8 shadow-sm text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h2 className="mb-2 text-lg font-semibold">Email Terkirim</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Silakan cek email Anda untuk link reset password.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <div className="w-full max-w-sm rounded-lg border bg-background p-8 shadow-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Coffee className="h-10 w-10" />
          <h1 className="text-2xl font-bold">CafePOS</h1>
          <p className="text-sm text-muted-foreground">Reset password Anda</p>
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
              className="w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            ) : (
              "Kirim Link Reset"
            )}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-primary underline-offset-4 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
