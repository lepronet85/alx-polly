# Project Rules and Guidelines

## Project Structure
- Place all poll-related components in `/app/polls/`
- Keep API routes in `/app/api/` organized by feature
- Store shared components in `/app/components/`
- Use `/app/lib/` for utility functions and constants
- Follow Next.js app router conventions for routing

## Form Handling
- Use react-hook-form for all form implementations
- Implement form validation using zod schemas
- Use shadcn/ui components for consistent UI elements
- Follow controlled component patterns
- Keep form logic in separate hooks

## Supabase Integration
- Use Row Level Security (RLS) policies for data access
- Implement authentication using Supabase Auth
- Follow repository pattern for database operations
- Use type-safe database queries with generated types
- Keep Supabase client initialization in `/app/lib/supabase`

## State Management
- Use React Query for server state management
- Implement optimistic updates for better UX
- Keep Supabase realtime subscriptions in dedicated hooks
- Handle loading and error states consistently
- Cache responses appropriately

## API Design
- Follow RESTful conventions for API endpoints
- Implement proper error handling and validation
- Use middleware for authentication checks
- Rate limit sensitive endpoints
- Document API responses and requirements

## Testing
- Write unit tests for hooks and utilities
- Use Playwright for E2E testing critical flows
- Mock Supabase calls in tests appropriately
- Test error states and edge cases
- Maintain test coverage above 80%

## Security
- Never commit .env files or secrets
- Implement proper CORS policies
- Validate all form inputs server-side
- Use prepared statements for database queries
- Regular security audits of dependencies
