import { Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  constructor() {
    console.log("app component init");

}
  ngOnInit(): void {
    // window.addEventListener("visibilitychange", function () {
    //   console.log("Visibility changed");
    //   if (document.visibilityState === "visible") {
    //     console.log("APP resumed");
    //     window.location.reload();
    //   }
    // });
  }

  title = 'babyest.client';
}
