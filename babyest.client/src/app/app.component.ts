import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

class LoginUser {
  Email: string = 'test1';
  Password: string = 'string';
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [RouterOutlet]
})
export class AppComponent {
  constructor() {

}

  title = 'babyest.client';
}
