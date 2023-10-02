import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import firebase from 'firebase/compat/app';

@Pipe({
  name: 'fbtimestamp'
})
export class FbtimestampPipe implements PipeTransform {

  constructor(public datepipe: DatePipe) { }

  transform(value: firebase.firestore.FieldValue | undefined) {

    if (!value) {
      return ''
    }

    const date = (value as firebase.firestore.Timestamp).toDate();
    return this.datepipe.transform(date, 'mediumDate');
  }

}
