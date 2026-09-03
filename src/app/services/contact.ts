import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IContact } from '../interfaces/contact';

@Injectable({
  providedIn: 'root'
})
export class Contact {
  private http = inject(HttpClient);
  private URL = environment.API_URL;
  private token = environment.TOKEN;

  saveContact(contact: IContact): Observable<IContact> {
    return this.http.post<IContact>(`${this.URL}/Check/?token=${this.token}`, contact);
  }
}
