import { Component, Input, OnInit } from '@angular/core';
import { KidActivity } from '../../models/kid-activity';
import { NgIf, NgForOf } from '@angular/common';
import { LocalStorageService } from '../../services/LocalStorage/local-storage.service';

@Component({
  selector: 'app-sync-status-pending-acts',
  standalone: true,
  imports: [NgForOf, NgIf],
  templateUrl: './sync-status-pending-acts.component.html',
})
export class SyncStatusPendingActsComponent implements OnInit {

  @Input() pendingActs: KidActivity[] = [];

  isDisplayed: boolean = false;

  constructor(private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.localStorageService.syncCompletedWithResult$.subscribe(value => {
      if(!value)
      {
        this.isDisplayed = true;
      }
    })
  }

  syncManually(): void {

  }

  close(): void {
    this.isDisplayed = false;
  }
}
