import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SigningpageComponent } from './signingpage/signingpage.component';
import { ParentDetailComponent } from "./parent/parent-detail/parent-detail.component";

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
  imports: [ParentDetailComponent, HttpClientModule, ParentDetailComponent]
})
export class AppComponent implements OnInit {
  constructor(private http: HttpClient) {

}

  usr = new LoginUser();
  public forecasts: WeatherForecast[] = [];

  public user: string = "";

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  }
  login() {
    this.http.post("/api/user/login", JSON.stringify({ Email: "test1", Password: "string" }), this.httpOptions).subscribe((response: any) => { console.log(response) });
  }

  weather() {
    this.http.get("/api/user/logout", { responseType: 'text' as 'json' }).subscribe((response: any) => { console.log(response) });
  }
  ngOnInit() {
    //this.getForecasts();
  }

  getForecasts() {
    this.http.get<WeatherForecast[]>('/weatherforecast').subscribe(
      (result) => {
        this.forecasts = result;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  title = 'babyest.client';
}
