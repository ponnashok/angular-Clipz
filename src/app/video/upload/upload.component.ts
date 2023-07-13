import { Component } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { last, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent {

  constructor(private storage: AngularFireStorage, private auth: AngularFireAuth) {
    auth.user.subscribe(user => this.user)
  }

  isDragOver = false

  file: null | File = null

  nextStep = false

  showAlert = false
  alertColor = 'blue'
  alertMsg = 'Please Wait your Clip is uploading'
  inSubmission = false
  percentage = 0
  showPercentage = false

  user: firebase.User | null = null

  title = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable: true
  })

  uploadForm = new FormGroup({
    title: this.title
  })

  storeFile($event: Event) {
    this.isDragOver = false

    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null

    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }

    console.log(this.file);

    this.title.setValue(this.file.name.replace("/(?i:^.*\.", ''))
    this.nextStep = true
  }

  uploadFile() {

    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait your Clip is uploading'
    this.inSubmission = true
    this.showPercentage = true

    const clipzFileName = uuid();
    const clipzPath = `clipz/${clipzFileName}.mp4`

    const task = this.storage.upload(clipzPath, this.file)
    console.log("File got uploaded");
    const clipRef = this.storage.ref(clipzPath)

    task.percentageChanges().subscribe(progress => {
      this.percentage = progress as number / 100
    })

    task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipRef.getDownloadURL())
    ).subscribe({
      next: (url) => {

        const clip = {
          uid: this.user?.uid,
          displayName: this.user?.displayName,
          title: this.title.value,
          fileName: `${clipzFileName}.mp4`,
          url
        }

        console.log(clip);

        this.alertColor = 'green'
        this.alertMsg = 'Success! your clip is uploaded'
        this.showPercentage = false
      },
      error: () => {
        this.alertColor = 'red'
        this.alertMsg = "Sorry your Upload is failed! Please try again later."
        this.showPercentage = false
        this.inSubmission = true
      }
    })
  }

}
