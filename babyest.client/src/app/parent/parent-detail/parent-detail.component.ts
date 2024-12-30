import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { KidsOfParent, Parent } from '../../models/parent';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService/auth.service';
import { Router } from '@angular/router';
import { ParentService } from '../../services/ParentService/parent.service';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';


@Component({
  selector: 'app-parent-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parent-detail.component.html',
  styleUrl: './parent-detail.component.css'
})


export class ParentDetailComponent implements OnInit {

  errorMessageDisplayed: string = '';
  constructor(private authService: AuthService,
    private router: Router,
    private parentService: ParentService,
    private currentKidService: CurrentKidService) { }

  currentParent: Parent = { Id: 0, Email: '', Kids: [] };
  activeKidId : number | null = null;

  ngOnInit(): void {
    this.parentService.getParentInfo().subscribe(
      {
        next: (data: Parent) => {
          this.currentParent = data;
          this.currentParent.Kids = data.Kids as KidsOfParent[];
        },
        error: (err: Error) => {
          this.errorMessageDisplayed = err.message;
        }
      });

      this.activeKidId = this.currentKidService.getCurrentKid();
    }

    // currentParent: Parent = { Email : "test@test.com", Id : 1, Kids : [
    //   {KidId : 1, KidName: "Kid1"},
    //   {KidId : 2, KidName: "Kid2"},
    //   {KidId : 5, KidName: "Kid3"},
    //   {KidId : 6, KidName: "Kid4"}] };

    // kids: Kid[] = [ { Name: "Kid1", BirthDate: "2024-08-08", Parents: ["test"], Activities : []}];

    selectKid(kidId: number): void {

      this.currentKidService.setCurrentKid(kidId);
      this.activeKidId = kidId;
      this.router.navigate(['/main/', kidId]);
    }


    logout(): void {
      this.authService.tryLogout().subscribe(
        {
          next: () => this.router.navigate(['/signin']),
          error: (err: Error) => {
            this.errorMessageDisplayed = err.message;
          }
        }
      );
    }



  }
