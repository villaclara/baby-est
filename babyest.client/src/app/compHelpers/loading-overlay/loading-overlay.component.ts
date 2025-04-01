import { Component, Input } from '@angular/core';
import { LoadingSpinnerComponent } from "../loading-spinner/loading-spinner.component";
import { NgIf } from '@angular/common';
@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [LoadingSpinnerComponent, NgIf],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.css'
})
export class LoadingOverlayComponent {
  @Input() errMsg : string = '';
}
