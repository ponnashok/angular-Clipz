import { Injectable } from '@angular/core';

interface IModal {
  id: string,
  visible: boolean
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {

  public modals: IModal[] = []

  constructor() { }

  unregister(id: string) {
    this.modals = this.modals.filter(
      element => element.id !== id
    )
  }

  register(id: string) {
    this.modals.push({
      id,
      visible: false
    })
  }

  isModalOpen(id: string): boolean {
    return Boolean(this.modals.find(element => element.id === id)?.visible);
  }

  toggelModel(id: string) {
    const modal = this.modals.find(element => element.id === id)
    if (modal) {
      modal.visible = !modal.visible
    }
  }
}
