import { Component } from '@angular/core';
import { Parent } from '../../models/parent';
import { Kid } from '../../models/kid';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-parent-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parent-detail.component.html',
  styleUrl: './parent-detail.component.css'
})


export class ParentDetailComponent {
  currentParent: Parent = { Email : "test@test.com", Id : 1, Kids : [
    {KidId : 1, KidName: "Kid1"},
    {KidId : 2, KidName: "Kid2"},
    {KidId : 5, KidName: "Kid3"},
    {KidId : 6, KidName: "Kid4"}] };

  kids: Kid[] = [ { Name: "Kid1", BirthDate: "2024-08-08", Parents: ["test"], Activities : []}];

}
