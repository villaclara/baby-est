import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css'
})
export class LoadingSpinnerComponent {
  @Input() mainColor: string = '#404756';
  @Input() minHeight: string = '80vh';
}
