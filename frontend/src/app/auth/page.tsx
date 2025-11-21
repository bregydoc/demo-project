"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLogin, useRegister } from "@/lib/hooks";

type AuthFormData = {
  username: string;
  password: string;
  email?: string;
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<AuthFormData>();

  const onSubmit = async (data: AuthFormData) => {
    try {
      if (isLogin) {
        await loginMutation.mutateAsync({
          username: data.username,
          password: data.password,
        });
      } else {
        await registerMutation.mutateAsync({
          username: data.username,
          password: data.password,
          email: data.email,
        });
      }
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Authentication failed";
      setError("root", { message: errorMessage });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-slate-800">
            Aesthetic Notes
          </h1>
          <p className="text-center text-slate-600 mb-8">
            {isLogin ? "Welcome back!" : "Create your account"}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                {...register("username", { required: "Username is required" })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                placeholder="Enter your username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email (optional)
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                {...register("password", { required: "Password is required" })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.root.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="w-full bg-teal hover:bg-teal/90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loginMutation.isPending || registerMutation.isPending
                ? "Loading..."
                : isLogin
                ? "Sign In"
                : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-teal hover:underline text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

