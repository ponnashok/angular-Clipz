import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class RegisteredValidators {


  static match(controlName: string, matchingControlName: string): ValidatorFn {

    return (groups: AbstractControl): ValidationErrors | null => {
      const control = groups.get('password')

      const matchingControl = groups.get('confirm_password')

      if (!control || !matchingControl) {
        return { controlNotFound: false }
      }

      const error = control.value === matchingControl.value ? null :
        { noMatch: true }

      matchingControl.setErrors(error)

      return error

    }


  }
}
