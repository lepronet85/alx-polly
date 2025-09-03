"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPollSchema,
  CreatePollFormValues,
} from "@/lib/validations/poll-schema";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PollWithOptions } from "@/lib/types/poll";

export default function EditPollPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema) as any,
    mode: "onBlur",
  });

  useEffect(() => {
    async function fetchPoll() {
      try {
        const response = await fetch(`/api/polls/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch poll');
        }
        const data = await response.json();
        const poll = data.poll as PollWithOptions;
        if (poll) {
          reset({
            title: poll.title,
            options: poll.options.map(o => o.text),
            end_date: poll.end_date ? new Date(poll.end_date).toISOString().split('T')[0] : null,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
    if (id) {
      fetchPoll();
    }
  }, [id, reset]);

  const { fields, append, remove } = useFieldArray<
    CreatePollFormValues,
    "options"
  >({
    control,
    name: "options",
  });

  const onSubmit: SubmitHandler<CreatePollFormValues> = async (data) => {
    if (!user) {
      setError("You must be logged in to edit a poll");
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/polls/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update poll");
      }

      router.push(`/polls/${id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/polls/${id}`}
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          ← Back to Poll
        </Link>

        <h1 className="text-3xl font-bold mb-6">Edit Poll</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form
          className="space-y-6"
          onSubmit={handleSubmit(onSubmit)}
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
                  {fields.length > 2 && (
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
              {isSubmitting ? "Updating..." : "Update Poll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
