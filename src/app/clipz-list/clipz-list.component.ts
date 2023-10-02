import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ClipService } from '../services/clip.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clipz-list',
  templateUrl: './clipz-list.component.html',
  styleUrls: ['./clipz-list.component.css'],
  providers: [DatePipe]
})
export class ClipzListComponent implements OnInit, OnDestroy {

  @Input() scrollable = true;

  constructor(public clipServices: ClipService) {
    this.clipServices.getClip()
  }

  ngOnInit(): void {
    if (this.scrollable) {
      window.addEventListener('scroll', this.handleScroll)
    }
  }

  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;

    const bottomofWindow = Math.round(scrollTop) + innerHeight === offsetHeight;

    if (bottomofWindow) {
      this.clipServices.getClip()
    }
  }

  ngOnDestroy(): void {
    if (this.scrollable) {
      window.addEventListener('scroll', this.handleScroll)
    }

    this.clipServices.pageClipz = []
  }

}
