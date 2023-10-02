import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import Iclips from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';


@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

  videoOrder = '1'
  clips: Iclips[] = []
  activeclip: Iclips | null = null
  sort$: BehaviorSubject<string>

  constructor(private router: Router, private route: ActivatedRoute, private clipService: ClipService, private modalService: ModalService) {

    this.sort$ = new BehaviorSubject(this.videoOrder)

  }

  ngOnInit(): void {
    // this.routeData.data.subscribe(console.log)
    this.route.queryParamMap.subscribe((params: Params) => {
      this.videoOrder = params['sort'] === '2' ? params['sort'] : '1'
      this.sort$.next(this.videoOrder)
    })

    this.clipService.getUserClipz(this.sort$).subscribe(docs => {
      this.clips = []

      docs.forEach(doc => {
        this.clips.push({
          DocID: doc.id,
          ...doc.data()
        })
      })
    })
  }

  sort(event: Event) {

    const { value } = (event.target as HTMLSelectElement)

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value
      }
    })
  }

  openModal($event: Event, clip: Iclips) {
    $event.preventDefault()

    this.activeclip = clip

    this.modalService.toggelModel('editClips')
  }

  update($event: Iclips) {

    this.clips.forEach((element, index) => {
      if (element.DocID == $event.DocID) {
        this.clips[index].title = $event.title
      }
    })
  }

  deleteClip($event: Event, clip: Iclips) {
    $event.preventDefault()

    this.clipService.deleteInStorage(clip)

    this.clips.forEach((element, index) => {
      if (element.DocID == clip.DocID) {
        this.clips.splice(index, 1)
      }
    })
  }

  async copyToClipBoard($event: MouseEvent, DocID: string | undefined) {
    $event.preventDefault()

    if (!DocID) {
      return
    }

    const url = `${location.origin}/clip/${DocID}`

    await navigator.clipboard.writeText(url)

    alert('Link is Copied!!!')

  }

}
