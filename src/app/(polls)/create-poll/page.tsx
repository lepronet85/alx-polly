"use client";

/**
 * Poll Creation Page Component
 * 
 * This component provides a form interface for users to create new polls.
 * It handles form validation, submission, and redirects users to their newly created poll.
 * Authentication is required - unauthenticated users are redirected to the login page.
 */

import React, { useState } from "react";
import Link from "next/link";
import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPollSchema,
  CreatePollFormValues,
} from "@/lib/validations/poll-schema";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Main component for creating polls
 * Handles form state, validation, and submission process
 */
export default function CreatePollPage() {
  // Get authentication state from context
  const { user, loading } = useAuth();
  const router = useRouter();
  // Local state for form submission status and errors
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("Auth state:", { user, loading });

  /**
   * Initialize react-hook-form with zod validation
   * Sets up form controls, validation, and default values
   */
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema) as any,
    defaultValues: {
      title: "",
      options: ["", ""], // Start with two empty options
      end_date: null,
    },
    mode: "onBlur", // Validate fields when they lose focus
  });

  /**
   * Field array hook for dynamically managing poll options
   * Allows adding and removing options in the form
   */
  const { fields, append, remove } = useFieldArray<
    CreatePollFormValues,
    "options"
  >({
    control,
    name: "options",
  });

  /**
   * Form submission handler
   * Validates user authentication, submits poll data to API, and handles responses
   * 
   * @param data - The validated form data containing poll information
   */
  const onSubmit: SubmitHandler<CreatePollFormValues> = async (data) => {
    console.log("Current user:", user);
    console.log("Loading state:", loading);
    console.log("Form data:", data);

    // Prevent submission while authentication is being checked
    if (loading) {
      setError("Vérification de votre authentification...");
      return;
    }

    // Redirect unauthenticated users to login
    if (!user) {
      console.error("No user found in client-side auth context");
      setError("You must be logged in to create a poll");
      router.push("/login");
      return;
    }

    // Update UI state for submission
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Submitting poll data to API");
      // Send poll data to the API endpoint
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Include authentication cookies
      });

      console.log("API response status:", response.status);
      const result = await response.json();
      console.log("API response data:", result);

      // Handle API errors
      if (!response.ok) {
        throw new Error(result.error || "Failed to create poll");
      }

      // Redirect to the newly created poll on success
      router.push(`/polls/${result.poll.id}`);
    } catch (err) {
      // Handle and display any errors that occur during submission
      console.error("Error creating poll:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      // Reset submission state regardless of outcome
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/polls"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Polls
        </Link>

        <h1 className="text-3xl font-bold mb-6">Create a New Poll</h1>

        {loading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-6">
            Vérification de votre authentification...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              Poll Question
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter your question"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.title ? "border-red-500" : ""
              }`}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Poll Options</label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    className={`flex-1 px-3 py-2 border rounded-md ${
                      errors.options?.[index] ? "border-red-500" : ""
                    }`}
                    {...register(`options.${index}`)}
                  />
                  {index > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {errors.options &&
                typeof errors.options === "object" &&
                !Array.isArray(errors.options) && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.options.message}
                  </p>
                )}
              {Array.isArray(errors.options) &&
                errors.options.some((error) => error) && (
                  <p className="text-red-500 text-sm mt-1">
                    All options must be filled
                  </p>
                )}
            </div>
            {fields.length < 10 && (
              <button
                type="button"
                onClick={() => append("") as any}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                + Add Another Option
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="end_date" className="block text-sm font-medium">
              End Date (Optional)
            </label>
            <input
              id="end_date"
              type="date"
              className="w-full px-3 py-2 border rounded-md"
              {...register("end_date")}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Creating..." : "Create Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
