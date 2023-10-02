import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { BehaviorSubject, combineLatest, lastValueFrom, map, of, switchMap } from 'rxjs';
import Iclips from 'src/app/models/clip.model';

@Injectable({
  providedIn: 'root'
})
export class ClipService implements Resolve<Iclips | null> {

  public clipCollection: AngularFirestoreCollection<Iclips>
  pageClipz: Iclips[] = []
  pendingRequest = false

  constructor(private db: AngularFirestore, private auth: AngularFireAuth, private storage: AngularFireStorage, private router: Router) {
    this.clipCollection = db.collection('clipz')
  }

  createClip(data: Iclips): Promise<DocumentReference<Iclips>> {
    return this.clipCollection.add(data)
  }

  getUserClipz(sort$: BehaviorSubject<string>) {
    return combineLatest([
      this.auth.user,
      sort$
    ]).pipe(
      switchMap(values => {

        const [user, sort] = values
        if (!user) {
          return of([])
        }

        const query = this.clipCollection.ref.where(
          'uid', '==', user.uid
        ).orderBy('timestamp',
          sort === '1' ? 'desc' : 'asc')
        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<Iclips>).docs)
    )
  }

  updateClip(id: string, title: string) {
    return this.clipCollection.doc(id).update({
      title
    })
  }

  async deleteInStorage(clip: Iclips) {

    const clipRef = this.storage.ref(`clipz/${clip.fileName}`)
    const screenShotRef = this.storage.ref(`screenshot/${clip.screenShotFileName}`)

    await clipRef.delete()
    await screenShotRef.delete()

    await this.clipCollection.doc(clip.DocID).delete()

  }

  async getClip() {
    if (this.pendingRequest) {
      return
    }
    this.pendingRequest = true;
    let query = this.clipCollection.ref
      .orderBy('timestamp', 'desc')
      .limit(6)

    const { length } = this.pageClipz

    if (length) {
      const lastClipzID = this.pageClipz[length - 1].DocID
      const lastDoc = await lastValueFrom(this.clipCollection.doc(lastClipzID)
        .get())

      query = query.startAfter(lastDoc)
    }

    const snapshot = await query.get()

    snapshot.forEach(doc => {
      this, this.pageClipz.push({
        DocID: doc.id,
        ...doc.data()
      })
    })
    this.pendingRequest = false
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.clipCollection.doc(route.params['id'])
      .get().pipe(
        map(snapShot => {
          const data = snapShot.data();

          if (!data) {
            this.router.navigate(['/'])
            return null;
          }
          return data
        })
      )
  }
}
