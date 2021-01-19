import validator from 'email-validator';
import { FieldError } from 'src/dto/error.dto';
import { UserCredentialsDto } from 'src/dto/user.dto';

export const passwordIsValid = (candidatePassword: string) => (candidatePassword.length > 3);

export const validateCredentials = (credentials: UserCredentialsDto): FieldError[] | null => {
  if (!validator.validate(credentials.email)) {
    return [{ field: 'email', message: 'invalid email' }];
  }

  if (credentials.username.length <= 2) {
    return [{ field: 'username', message: 'username too short' }];
  }

  if (!passwordIsValid(credentials.password)) {
    return [{ field: 'password', message: 'password too short' }];
  }

  return null;
};
