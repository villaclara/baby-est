import { Component, Input, OnInit } from '@angular/core';
import { KidActivity } from '../../models/kid-activity';
import { NgIf, NgForOf } from '@angular/common';
import { LocalStorageService } from '../../services/LocalStorage/local-storage.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-sync-status-pending-acts',
  standalone: true,
  imports: [NgForOf, NgIf, DatePipe],
  templateUrl: './sync-status-pending-acts.component.html',
})
export class SyncStatusPendingActsComponent implements OnInit {

  failedActs: KidActivity[] = [];
  isDisplayed: boolean = false;

  constructor(private localStorageService: LocalStorageService) { }

  ngOnInit(): void {
    this.localStorageService.syncCompletedWithResult$.subscribe(value => {
      if(!value)
      {
        this.isDisplayed = true;
        this.failedActs = this.localStorageService.failedSyncActs;
      }
    })
  }

  close(): void {
    this.isDisplayed = false;
    this.localStorageService.failedSyncActs = [];
    this.failedActs = [];
  }
}
