import validator from 'validator';

export function validatePassword(password) {
  if (!password) {
    return {
      valid: false,
      message: 'Password is required.',
    };
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 6,
      minLowercase: 0,
      minUppercase: 0,
      minNumbers: 2,
      minSymbols: 1,
    })
  ) {
    return {
      valid: false,
      message:
        'Password must be at least 6 characters long and contain at least one special character and two numbers.',
    };
  }

  return { valid: true };
}

export function validateEmail(email) {
  if (!email) {
    return {
      valid: false,
      message: 'Email is required.',
    };
  }

  if (!validator.isEmail(email)) {
    return {
      valid: false,
      message: 'Invalid email format.',
    };
  }

  return { valid: true };
}
