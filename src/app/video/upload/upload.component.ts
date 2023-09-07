import { Component, OnDestroy } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, forkJoin, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {

  constructor(private storage: AngularFireStorage, private auth: AngularFireAuth, private clipsService: ClipService, private router: Router, public ffmpegService: FfmpegService) {
    this.auth.user.subscribe(user => this.user = user)
    this.ffmpegService.init()
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
  selectedScreenShot = ''

  user: firebase.User | null = null

  task?: AngularFireUploadTask

  screenShot: string[] = []

  screenShotTask?: AngularFireUploadTask

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

  async storeFile($event: Event) {

    if (this.ffmpegService.isRunning) {
      return
    }

    this.isDragOver = false

    this.file = ($event as DragEvent).dataTransfer ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null

    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }

    this.screenShot = await this.ffmpegService.getScreenShot(this.file)

    this.selectedScreenShot = this.screenShot[0]

    console.log(this.file);

    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''))
    this.nextStep = true
  }

  async uploadFile() {
    this.uploadForm.disable()

    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait your Clip is uploading'
    this.inSubmission = true
    this.showPercentage = true

    const clipzFileName = uuid();
    const clipzPath = `clipz/${clipzFileName}.mp4`

    const screenShotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenShot
    )

    const screenShotPath = `screenShot/${clipzFileName}.png`

    this.task = this.storage.upload(clipzPath, this.file)

    const clipRef = this.storage.ref(clipzPath)

    this.screenShotTask = this.storage.upload(screenShotPath, screenShotBlob)

    const screenShotRef = this.storage.ref(screenShotPath)

    combineLatest([this.task.percentageChanges(),
    this.screenShotTask.percentageChanges()
    ]).subscribe((progress) => {

      const [clipProgress, screenShotProgress] = progress

      if (!clipProgress || !screenShotProgress) {
        return
      }
      const total = clipProgress + screenShotProgress
      this.percentage = total as number / 200
    })

    forkJoin([this.task.snapshotChanges(),
    this.screenShotTask.snapshotChanges()
    ])
      .pipe(
        switchMap(() => forkJoin([clipRef.getDownloadURL(),
        screenShotRef.getDownloadURL()
        ]))
      ).subscribe({
        next: async (urls) => {

          const [clipURL, screenShotURL] = urls

          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.title.value,
            fileName: `${clipzFileName}.mp4`,
            url: clipURL,
            screenShotURL: screenShotURL,
            screenShotFileName: `${clipzFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }

          const clipDocRef = await this.clipsService.createClip(clip)



          this.alertColor = 'green'
          this.alertMsg = 'Success! your clip is uploaded'
          this.showPercentage = false

          setTimeout(() => {
            this.router.navigate([
              'clip', clipDocRef.id
            ])
          }, 1000)
        },
        error: () => {
          this.uploadForm.enable()
          this.alertColor = 'red'
          this.alertMsg = "Sorry your Upload is failed! Please try again later."
          this.showPercentage = false
          this.inSubmission = true
        }
      })

  }

  ngOnDestroy(): void {
    this.task?.cancel()
  }

}
