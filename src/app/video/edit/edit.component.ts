import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Iclips from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {

  @Input() activeClip: Iclips | null = null

  @Output() update = new EventEmitter()

  inSubmission = false
  showAlert = false
  alertColor = 'blue'
  alertMsg = 'Please wait, Updating Clip...'

  clipID = new FormControl('', {
    nonNullable: true
  })
  title = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable: true
  })

  editForm = new FormGroup({
    title: this.title,
    id: this.clipID
  })

  constructor(private modalService: ModalService, private clipService: ClipService) { }

  ngOnInit(): void {

    this.modalService.register('editClips')
  }

  ngOnChanges(): void {
    if (!this.activeClip) {
      return
    }

    this.inSubmission = false
    this.showAlert = false

    this.clipID.setValue(this.activeClip.DocID as string)
    this.title.setValue(this.activeClip.title)
  }

  async submit() {

    if (!this.activeClip) {
      return
    }
    this.inSubmission = true
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait, Updating Clip...'

    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value)
    } catch (e) {
      this.inSubmission = false
      this.alertColor = 'red'
      this.alertMsg = 'Something went wrong...'
      return
    }

    this.activeClip.title = this.title.value
    this.update.emit(this.activeClip)

    this.inSubmission = false
    this.alertColor = 'green'
    this.alertMsg = 'Success...'
  }

  ngOnDestroy(): void {
    this.modalService.unregister('editClips')
  }

}
