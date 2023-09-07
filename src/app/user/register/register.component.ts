import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import IUsers from 'src/app/models/user.model';
import { RegisteredValidators } from '../validators/registered-validators';
import { EmailTaken } from '../validators/email-taken';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private authS: AuthService, private emailTaken: EmailTaken) { }

  inSubmission = false

  name = new FormControl('', [Validators.required, Validators.minLength(3)])

  email = new FormControl('',
    [Validators.required, Validators.email],
    [this.emailTaken.validate])

  age = new FormControl<number | null>(null, [Validators.required, Validators.min(18), Validators.max(120)])

  password = new FormControl('', [
    Validators.required,
    Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}$")])

  confirm_password = new FormControl('')

  phoneNumber = new FormControl('', [Validators.required, Validators.minLength(13), Validators.maxLength(13)])

  showAlert = false
  alertMsg = 'Please wait. your account is creating:)'
  alertColor = 'blue'


  newRegister = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber
  }, [RegisteredValidators.match('password', 'confirm_password')])

  async register() {
    this.showAlert = true
    this.alertMsg = 'Please wait. your account is creating:)'
    this.alertColor = 'blue'
    this.inSubmission = true

    try {
      await this.authS.createUser(this.newRegister.value as IUsers)
    } catch (e) {


      this.alertMsg = "Sorry! unexpected error occured"
      this.alertColor = "red"
      this.inSubmission = false
      return
    }

    this.alertMsg = "Success your account has created :)"
    this.alertColor = "green"
  }

}
