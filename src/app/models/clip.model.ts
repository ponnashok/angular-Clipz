import firebase from 'firebase/compat/app'

export default interface Iclips {
  DocID?: string
  uid: string;
  displayName: string;
  fileName: string;
  title: string;
  url: string;
  timestamp: firebase.firestore.FieldValue;
  screenShotURL: string;
  screenShotFileName: string;
}
