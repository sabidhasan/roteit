import { FieldError } from "../generated/graphql";

export const parseGQLErrors = (errors: FieldError[]): { [k: string]: string } => (
  errors.reduce((acc, val) => {
    acc[val.field] = val.message;
    return acc;
  }, {} as any)
);
