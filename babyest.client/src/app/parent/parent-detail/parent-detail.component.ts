import { Component, OnDestroy, OnInit } from '@angular/core';
import { KidsOfParent, Parent } from '../../models/parent';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService/auth.service';
import { Router } from '@angular/router';
import { ParentService } from '../../services/ParentService/parent.service';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';
import { FormsModule } from '@angular/forms';
import { KidService } from '../../services/KidService/kid.service';
import { Kid } from '../../models/kid';
import { LoadingSpinnerComponent } from "../../compHelpers/loading-spinner/loading-spinner.component";
import { ErrorPageComponent } from "../../errorpage/error-page/error-page.component";
import { NetworkService } from '../../services/NetworkService/network-service.service';
import { OfflineDefaultPageComponent } from "../../offlinepage/offline-default-page/offline-default-page.component";
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-parent-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorPageComponent, OfflineDefaultPageComponent],
  templateUrl: './parent-detail.component.html',
  styleUrl: './parent-detail.component.css'
})


export class ParentDetailComponent implements OnInit, OnDestroy {


  onKidSelected(id: number) {
    this.currentKidService.setCurrentKid(id);
    this.activeKidId = this.currentKidService.getCurrentKid();
    this.router.navigateByUrl('main/' + this.activeKidId);
  }

  errorMessageDisplayed: string = '';
  isPlusKidBtnClicked: boolean = false;
  isEditingKid: boolean = false;
  selectedEditingKidId: number = 0;
  newParentEmail: string = '';

  selectedTheme: string = '';
  isAutoThemeChecked: boolean = true;

  version: string = "v1.0.16";
  constructor(private authService: AuthService,
    private router: Router,
    private parentService: ParentService,
    private currentKidService: CurrentKidService,
    private kidService: KidService,
    private networkService: NetworkService) { }


  currentParent: Parent = { Id: 0, Email: '', Kids: [] };
  activeKidId: number | null = null;

  kidModelName: string = '';
  kidModelBirth: Date = new Date();

  isLoading: boolean = false;
  isOnline: boolean = false;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {

    // SUbscriptions and receive local values
    this.activeKidId = this.currentKidService.getCurrentKid();
    this.selectedTheme = this.currentKidService.getTheme();
    this.isAutoThemeChecked = this.currentKidService.getAutoTheme();
    this.currentKidService.themeChanged$.subscribe((newTheme) => this.selectedTheme = newTheme);
    this.networkService.onlineStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isOnline => {
        if (!this.isOnline && isOnline) {
          this.isLoading = true;
          this.initializeParentInfo();
        }
        this.isOnline = isOnline;
      });

    // Assign isOnline and do not call the rest if we are offline
    this.isOnline = this.networkService.currentNetworkStatus;
    if (!this.isOnline) {
      return;
    }


    this.initializeParentInfo();

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.currentKidService.kidChanged$.unsubscribe();
  }


  plusKidBtnClick(kidNumber: number): void {

    // No kid selected, we want to add new one.
    if (kidNumber == -1) {
      this.kidModelBirth = new Date();
      this.kidModelName = '';
      this.selectedEditingKidId = -1;
      this.isEditingKid = true;
    }
    // else display the selected kid info.
    else {
      this.isEditingKid = true;
      this.selectedEditingKidId = kidNumber;
      let kid = this.kidService.getKidById(kidNumber)
        .subscribe({
          next: (data: Kid) => {
            this.kidModelName = data.Name;
            this.kidModelBirth = new Date(data.BirthDate);
          },
          error: () => console.log("error when parsing")
        });

    }
    this.isPlusKidBtnClicked = !this.isPlusKidBtnClicked;
  }

  addKidBtnClick(): void {
    this.isPlusKidBtnClicked = false;
    this.isEditingKid = false;

    // Allow the starting value of Date to be converted to string and send to api.
    let dateOnly: string = '';
    try {
      dateOnly = this.kidModelBirth.toISOString().split('T')[0];
    }
    catch {
      dateOnly = this.kidModelBirth.toString();
    }
    let kid: Kid = { Name: this.kidModelName, BirthDate: dateOnly, Activities: [], Parents: [] };
    this.kidService.addKid(kid)
      .subscribe({
        next: () => {
          this.initializeParentInfo();
        },
        error: (err) => console.log(err.message)
      });

  }

  updateKidBtnClick(): void {

    // Allow the starting value of Date to be converted to string and send to api.
    let dateOnly: string = '';
    try {
      dateOnly = this.kidModelBirth.toISOString().split('T')[0];
    }
    catch {
      dateOnly = this.kidModelBirth.toString();
    }
    let kid: Kid = { Name: this.kidModelName, BirthDate: dateOnly, Activities: [], Parents: [] };
    this.kidService.updateKid(kid, this.selectedEditingKidId)
      .subscribe({
        next: () => {
          this.initializeParentInfo();
        },
        error: (err) => console.log(err.message)
      });

    this.isEditingKid = false;
  }

  deleteKidBtnClick(): void {

    if (this.selectedEditingKidId == this.activeKidId) {
      this.activeKidId = null;
      this.currentKidService.setCurrentKid(0);
    }

    this.kidService.deleteKidById(this.selectedEditingKidId).subscribe({
      next: (value) => {
        this.initializeParentInfo();
        this.isEditingKid = false;
        this.isPlusKidBtnClicked = false;
      },
      error: (err) => this.errorMessageDisplayed = err.message
    });
  }

  selectKid(kidId: number): void {
    this.currentKidService.setCurrentKid(kidId);
    this.activeKidId = kidId;
    this.router.navigate(['/main/', kidId]);
  }

  onBackBtnClick(): void {
    this.isEditingKid = false;
    this.isPlusKidBtnClicked = false;
  }


  addNewParent(): void {
    if (this.newParentEmail === '') {
      return;
    }

    this.parentService.addNewParentToKid(this.selectedEditingKidId, this.newParentEmail).subscribe(
      {
        next: () => {
          this.initializeParentInfo();
          this.newParentEmail = '';
        },
        error: (err) => { console.log(err.message) }
      }
    );


  }

  private initializeParentInfo(): void {

    this.isLoading = true;
    this.errorMessageDisplayed = '';
    this.parentService.getParentInfo().subscribe(
      {
        next: (data: Parent) => {
          this.currentParent = data;
          this.currentParent.Kids = data.Kids as KidsOfParent[];

          this.isLoading = false;
        },
        error: (err: Error) => {
          this.errorMessageDisplayed = err.message;
          this.isLoading = false;
        }
      });
  }

  logout(): void {
    this.authService.tryLogout().subscribe(
      {
        next: () => {
          localStorage.removeItem("activekid");
          this.router.navigate(['/signin'])
        },

        error: (err: Error) => {
          this.errorMessageDisplayed = err.message;
        }
      }
    );
  }


  onThemeChange(): void {
    console.log("new theme - " + this.selectedTheme);
    this.currentKidService.setTheme(this.selectedTheme);
  }

  onAutoThemeChanged(): void {
    this.currentKidService.setAutoTheme(this.isAutoThemeChecked);
  }

}
