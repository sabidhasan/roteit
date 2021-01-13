import { FieldError } from "../generated/graphql";

export const parseGQLErrors = (errors: FieldError[]) => (
  errors.reduce((acc, val) => {
    acc[val.field] = val.message;
    return acc;
  }, {})
);
