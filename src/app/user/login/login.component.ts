import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  constructor(private auth: AngularFireAuth) { }

  credentials = {
    email: '',
    password: ''
  }

  showAlert = false
  alertMsg = "Please wait! we're logging in:)"
  alertColor = "blue"
  inSubmission = false

  async login() {

    this.showAlert = true
    this.alertMsg = "Please wait! we're logging in:)"
    this.alertColor = "blue"
    this.inSubmission = true

    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email, this.credentials.password
      )
    } catch (e) {

      this.alertMsg = "Sorry unexpected error occur :( "
      this.alertColor = "red"
      this.inSubmission = false

      return

    }

    this.alertMsg = "Success! you're loggrd in :)"
    this.alertColor = "green"

  }

}
