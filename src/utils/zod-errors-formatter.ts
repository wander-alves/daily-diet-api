import { type ZodIssue } from 'zod';

export function zodErrorsFormatter(errors: ZodIssue[]) {
  return errors.map((error) => {
    return { [error.path[0]]: error.message }
  });
}