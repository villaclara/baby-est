import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { KidsOfParent, Parent } from '../../models/parent';
import { Kid } from '../../models/kid';
import { CommonModule } from '@angular/common';
import { AuthServiceService } from '../../services/AuthService/auth-service.service';
import { Router } from '@angular/router';
import { ParentServiceService } from '../../services/ParentService/parent-service.service';
import { map } from 'rxjs';
import { CurrentKidService } from '../../services/CurrentKid/current-kid.service';


@Component({
  selector: 'app-parent-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parent-detail.component.html',
  styleUrl: './parent-detail.component.css'
})


export class ParentDetailComponent implements OnInit {

  constructor(private authService: AuthServiceService, 
    private router: Router,
    private parentService: ParentServiceService,
    private currentKidService : CurrentKidService) { }
  
  
  ngOnInit(): void {

    this.parentService.getParentInfo().subscribe(
      (data : any) => 
      {
        // bypass the redirectUrl by CookieAuthenticaiton of WebApi
        if(data == "403")
        {
          this.router.navigateByUrl('signin');
        }
        else 
        {

          this.currentParent = {
            Id : data.id,
            Email : data.email,
            Kids: data.kids as KidsOfParent[]
          };
        }
      });

  }


  currentParent : Parent = { Id : 0, Email: '', Kids : []};
  // currentParent: Parent = { Email : "test@test.com", Id : 1, Kids : [
  //   {KidId : 1, KidName: "Kid1"},
  //   {KidId : 2, KidName: "Kid2"},
  //   {KidId : 5, KidName: "Kid3"},
  //   {KidId : 6, KidName: "Kid4"}] };

  // kids: Kid[] = [ { Name: "Kid1", BirthDate: "2024-08-08", Parents: ["test"], Activities : []}];

  selectKid(kidId : number) : void {
    
    
    this.currentKidService.setCurrentKid(kidId);
    
    
    this.router.navigate(['/main/', kidId]);


  }

  
  logout() : void {
    this.authService.tryLogout().subscribe(
      { 
        next: () => this.router.navigate(['/signin']), 
        error: () => {}
      }
    );
  }



}
