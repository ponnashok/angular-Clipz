import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {

  isReady = false
  private ffmpeg
  isRunning = false

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true })
  }

  async init() {
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load()

    this.isReady = true
  }

  async getScreenShot(file: File) {
    const data = await fetchFile(file)

    this.ffmpeg.FS('writeFile', file.name, data)

    this.isRunning = true

    const seconds = [1, 2, 3]
    const command: string[] = []

    seconds.forEach(second => {
      command.push(
        //input
        '-i', file.name,
        //Output Options
        '-ss', `00:00:0${second}`,
        '-frames:v', '1',
        '-filter:v', 'scale=510:-1',
        //Output
        `Output_0${second}.png`
      )
    })

    await this.ffmpeg.run(
      ...command
    )

    const screenshots: string[] = []

    seconds.forEach(second => {
      const screenshotsimage = this.ffmpeg.FS('readFile', `Output_0${second}.png`)

      const screenshotsblobs = new Blob(
        [screenshotsimage.buffer], {
        type: 'image/png'
      }
      )

      const screenshotsURL = URL.createObjectURL(screenshotsblobs)
      screenshots.push(screenshotsURL)
    })

    this.isRunning = false

    return screenshots
  }

  async blobFromURL(url: string) {
    const response = await fetch(url)

    const blob = await response.blob()

    return blob
  }
}
