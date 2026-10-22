import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: string;
  title?: string;
  text: string;
  type: 'success' | 'danger' | 'info' | 'warning';
  delay?: number;
}

@Injectable({
  providedIn: 'root',
})
export class Toast {
  message = signal<ToastMessage[]>([]);

  show(message: Omit<ToastMessage, 'id'>) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const toastWithId: ToastMessage = { ...message, id };

    this.message.update(list => [...list, toastWithId]);

    setTimeout(() => this.dismiss(toastWithId), message.delay ?? 3000);
  }

  dismiss(message: ToastMessage) {
    this.message.update(list => list.filter((m) => m.id !== message.id));
  }

  clearAll() {
    this.message.set([]);
  }
}
