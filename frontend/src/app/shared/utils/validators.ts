import { AbstractControl, ValidationErrors } from '@angular/forms';

export function strongPassword(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;

  const hasMinLength = value.length >= 8;
  const hasNumber = /\d/.test(value);
  const hasLetter = /[a-zA-Z]/.test(value);

  return hasMinLength && hasNumber && hasLetter
    ? null
    : { strongPassword: true };
}
