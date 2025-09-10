/**
 * Poll Validation Schema Module
 * 
 * This module defines the validation schemas for poll-related data using Zod.
 * These schemas ensure that all poll data meets the application's requirements
 * before being processed or stored in the database.
 */

import { z } from 'zod';

/**
 * Schema for validating poll creation and update requests
 * 
 * Validates:
 * - Poll title: Must be between 5-255 characters
 * - Poll options: Must have 2-10 options, each between 1-100 characters
 * - End date: Optional string that can be null
 */
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
    .min(2, { message: 'You must provide at least 2 options' }) // At least 2 options required
    .max(10, { message: 'You cannot have more than 10 options' }), // Limit to 10 options for UI reasons
  end_date: z.string().nullable().optional(), // Optional end date for the poll
});

/**
 * Type definition derived from the createPollSchema
 * Used for form handling with react-hook-form and for API requests/responses
 */
export type CreatePollFormValues = {
  title: string;      // The poll question or title
  options: string[];  // Array of option text strings
  end_date?: string | null; // Optional end date in ISO string format
};