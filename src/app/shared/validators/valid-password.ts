import { UntypedFormControl } from '@angular/forms';

  // password check - see https://www.ocpsoft.org/tutorials/regular-expressions/password-regular-expression/
export function ValidPassword(control: UntypedFormControl) {
  const value: string = control.value;

  if (value == null || value.length === 0) {
    return null;
  }

  let count = 0;
  let match = ''; // just for debugging the regex
  if (value.match('.*\\d.*') ) {
    count ++;
    match += 'd';
  }
  if (value.match('.*[a-z].*') ) {
    count ++;
    match += 'a';
  }
  if (value.match('.*[A-Z].*') ) {
    count ++;
    match += 'A';
  }
  if (value.match(/.*[\!\@\#\$\%\^\&\*\)\(\+\=\.\<\>\{\}\[\]\:\;\'\"\|\~\`\_\-].*/g)) {
    count ++;
    match += '@';
  }

  if (count < 4) {
    control.setErrors({ invalidPassword: true });
    return { invalidPassword: true};
  } else {
    return null;
  }
}
