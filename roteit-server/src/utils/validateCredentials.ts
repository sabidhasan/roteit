import validator from 'email-validator';
import { FieldError } from 'src/dto/error.dto';
import { UserCredentialsDto } from 'src/dto/user.dto';

export const validateCredentials = (credentials: UserCredentialsDto): FieldError[] | null => {
  if (!validator.validate(credentials.email)) {
    return [{ field: 'email', message: 'invalid email' }];
  }

  if (credentials.username.length <= 2) {
    return [{ field: 'username', message: 'username too short' }];
  }

  if (credentials.password.length <= 3) {
    return [{ field: 'password', message: 'password too short' }];
  }

  return null;
};
