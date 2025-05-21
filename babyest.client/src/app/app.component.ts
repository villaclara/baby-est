import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NetworkService } from './services/NetworkService/network-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent {
  constructor(private networkService: NetworkService) {
    this.networkService.checkOnlineStatusManually();
}

  title = 'babyest.client';
}
