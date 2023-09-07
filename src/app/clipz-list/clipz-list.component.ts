import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clipz-list',
  templateUrl: './clipz-list.component.html',
  styleUrls: ['./clipz-list.component.css']
})
export class ClipzListComponent implements OnInit, OnDestroy {

  constructor(public clipServices: ClipService) {
    this.clipServices.getClip()
  }

  ngOnInit(): void {
    window.addEventListener('scroll', this.handleScroll)
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
    window.addEventListener('scroll', this.handleScroll)
  }

}
