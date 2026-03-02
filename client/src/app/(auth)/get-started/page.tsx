"use client";

import React, { useEffect } from "react";
import { Button } from "@heroui/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/lib/authClient";

const getStartedSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    nuemail: z
        .string()
        .regex(
            /^[klmfpi][0-9]{6}@nu\.edu\.pk$/,
            "NU Email must be a valid NU email address"
        ),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

type GetStartedForm = z.infer<typeof getStartedSchema>;

type ApiError = {
    body?: string;
    detail?: string;
    message?: string;
    status?: string | number;
    statusText?: string;
};

const getErrorMessage = (err: unknown): string => {
    const e = err as ApiError | undefined;

    if (!e) return "Registration failed";

    if (e.body && typeof e.body === "object" && !Array.isArray(e.body)) {
        const firstKey = Object.keys(e.body)[0];
        if (firstKey && Array.isArray(e.body[firstKey])) {
            return String(e.body[firstKey][0]);
        }
        if (typeof e.body[firstKey] === "string") {
            return e.body[firstKey];
        }
    }

    if (typeof e.body === "string") return e.body;
    if (e.detail) return e.detail;
    if (e.message) return e.message;
    if (e.status) return `${e.status} ${e.statusText || ""}`.trim();

    return "Registration failed";
};

const GetStarted = () => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isValid },
    } = useForm<GetStartedForm>({
        resolver: zodResolver(getStartedSchema),
        mode: "onChange",
    });

    const submittedEmail = watch("nuemail");

    const mutation = useMutation({
        mutationFn: async (data: GetStartedForm) => {
            const payload = {
                full_name: data.fullName,
                nu_email: data.nuemail,
                password: data.password,
            };
            return await registerUser(payload);
        },
        onSuccess: () => {
            reset();
        },
        onError: (err) => {
            console.error("Registration error", err);
        },
    });

    const onSubmit = (data: GetStartedForm) => {
        mutation.mutate(data);
    };

    const baseInputClasses =
        "p-2 rounded border-2 focus:border-primarypurple/80 focus:ring-0 outline-none transition-colors duration-200";

    const getInputClass = (fieldError?: unknown) =>
        `${baseInputClasses} ${fieldError ? "border-red-500" : "border-gray-300"}`;

    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    useEffect(() => {
        if (mutation.isError) {
            setErrorMessage(getErrorMessage(mutation.error));
        } else {
            setErrorMessage(null);
        }
    }, [mutation.isError, mutation.error]);

    // ── Success screen ────────────────────────────────────────────────────────
    if (mutation.isSuccess) {
        return (
            <div className="sm:w-2/3 mx-auto space-y-6">
                <div className="border-2 border-primarypurple/30 bg-primarypurple/5 rounded-xl p-8 flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primarypurple/10 flex items-center justify-center text-4xl">
                        ✉️
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-primarypurple">
                        Check your email!
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        We&apos;ve sent a verification link to{" "}
                        <span className="font-semibold text-black">{submittedEmail}</span>.
                        <br />
                        Click the link in the email to activate your account.
                    </p>
                    <p className="text-xs text-gray-400">
                        The link expires in 24 hours. Didn&apos;t get it? Check your spam folder or{" "}
                        <Link href="/verify-email/resend" className="text-primarypurple underline font-medium">
                            resend the email
                        </Link>
                        .
                    </p>
                    <Link
                        href="/login"
                        className="mt-2 bg-primarygreen text-black font-bold px-6 py-2 rounded hover:opacity-90 transition-opacity text-sm uppercase tracking-wide"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="sm:w-2/3 mx-auto space-y-8">
            <h1 className="text-left text-4xl font-black italic tracking-[-0.20rem] uppercase underline underline-offset-2 decoration-primarygreen bg-primarygreen/20 w-fit">
                Get Started
            </h1>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Full Name */}
                <div className="flex flex-col">
                    <label htmlFor="fullName" className="font-semibold text-lg">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        {...register("fullName")}
                        className={getInputClass(errors.fullName)}
                    />
                    {errors.fullName && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.fullName.message}
                        </p>
                    )}
                </div>

                {/* NU Email */}
                <div className="flex flex-col">
                    <label htmlFor="nuemail" className="font-semibold text-lg">
                        NU Email
                    </label>
                    <input
                        type="text"
                        id="nuemail"
                        {...register("nuemail")}
                        className={getInputClass(errors.nuemail)}
                    />
                    {errors.nuemail && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.nuemail.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="flex flex-col">
                    <label htmlFor="password" className="font-semibold text-lg">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        {...register("password")}
                        className={getInputClass(errors.password)}
                    />
                    {errors.password && (
                        <p className="text-sm text-red-500 mt-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <div>
                    already have an account?{" "}
                    <Link
                        href="/login"
                        className="text-primarypurple font-semibold underline"
                    >
                        Login
                    </Link>
                </div>

                <div className="flex w-full justify-end">
                    <Button
                        className="bg-primarygreen text-black font-bold"
                        type="submit"
                        isDisabled={!isValid || mutation.isPending}
                    >
                        {mutation.isPending ? "Creating..." : "Create Account"}
                    </Button>
                </div>

                {errorMessage && (
                    <div className="mt-4 p-3 rounded text-sm bg-red-100 text-red-700">
                        {errorMessage}
                    </div>
                )}
            </form>
        </div>
    );
};

export default GetStarted;