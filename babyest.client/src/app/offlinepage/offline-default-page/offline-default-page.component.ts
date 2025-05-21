import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offline-default-page',
  standalone: true,
  imports: [],
  templateUrl: './offline-default-page.component.html',
  styleUrl: './offline-default-page.component.css'
})
export class OfflineDefaultPageComponent {

  @Input() pageLinkToReload: string = "/";

  constructor(private router: Router) { }

  reloadPage() : void {
    this.router.navigateByUrl("/", {skipLocationChange : true}).then(
      () => this.router.navigateByUrl(this.pageLinkToReload)
    );
  }
}
