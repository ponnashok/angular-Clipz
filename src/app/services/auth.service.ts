import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, delay, filter, map, of, switchMap } from 'rxjs';
import IUsers from 'src/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usersCollections: AngularFirestoreCollection<IUsers>

  public isAuthenticated$!: Observable<boolean>;

  public isAuthenticatedWithDelay$: Observable<boolean>;

  private redirect = false;

  constructor(private auth: AngularFireAuth, private db: AngularFirestore, private router: Router, private activatedRoute: ActivatedRoute) {
    this.usersCollections = db.collection('user')

    this.isAuthenticated$ = this.auth.user.pipe(
      map(user => !!user)
    )

    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
      delay(2000)
    )

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => this.activatedRoute.firstChild),
      switchMap(route => route?.data ?? of({ authOnly: false }))
    ).subscribe(data => {
      this.redirect = data['authOnly'] ?? false;
    })
  }



  public async createUser(userData: IUsers) {

    if (!userData.password) {
      throw new Error("Password not provided!")
    }

    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email as string, userData.password as string
    )

    if (!userCred.user) {
      throw new Error("User cant be found")

    }

    await this.usersCollections.doc(userCred.user.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber
    })

    await userCred.user.updateProfile(
      {
        displayName: userData.name
      }
    )
  }

  public async logout($event?: Event) {

    if ($event) {

      $event.preventDefault()

    }

    await this.auth.signOut()

    if (this.redirect) {
      await this.router.navigateByUrl('/')
    }


  }

}
