import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ParentDetailComponent } from './parent/parent-detail/parent-detail.component';
import { AppComponent } from './app.component';
import { SigningpageComponent } from './signingpage/signingpage.component';
import { DashboardMainComponent } from './dashboard/dashboard-main/dashboard-main.component';
import { HomeComponent } from './home/home.component';

// HomeComponent is empty component with only router-outlet and footer displayed. 
// Because we need to display footer in pages except /signin
// The navigation looks like this:
// https://localhost:4200 --> HomeComponent matches and --> empty of HomeComponent matches - DashboardMainCompoent
// https://localhost:4200/parent -> HomeComponent -> ParentDetailComponent
// https://localhost:4200/singin -> SignInPageComponent matches, HomeComponent is not used
// etc.
const routes: Routes = [
  { path: 'signin', component: SigningpageComponent, pathMatch: 'full' },
  { path: '',
    children: [
      // { path: '', redirectTo: ('main/:id'), pathMatch: 'prefix'},
      { path: 'parent', component: ParentDetailComponent },
      { path: 'main/:id', component: DashboardMainComponent },
    ],
    component: HomeComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
