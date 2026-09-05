import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { Toast } from './components/toast/toast';
import { Spinner } from './components/spinner/spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Footer, Toast, Spinner],
  template: `
    <app-navbar />
    <app-spinner />
    <app-toast />
    <main>
      <router-outlet />
    </main>
    <app-footer />
  `,
  styleUrls: ['./app.scss'],
})
export class App {}
