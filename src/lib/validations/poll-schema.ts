import { z } from 'zod';

export const createPollSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Poll question must be at least 5 characters' })
    .max(255, { message: 'Poll question must be less than 255 characters' }),
  options: z
    .array(
      z.string().min(1, { message: 'Option cannot be empty' }).max(100, {
        message: 'Option must be less than 100 characters',
      })
    )
    .min(2, { message: 'You must provide at least 2 options' })
    .max(10, { message: 'You cannot have more than 10 options' }),
  end_date: z.string().nullable().optional(),
});

export type CreatePollFormValues = {
  title: string;
  options: string[];
  end_date?: string | null;
};