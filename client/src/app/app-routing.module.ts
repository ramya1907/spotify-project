import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ViewComponent } from './view/view.component';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { usernameGuard } from './username.guard';
import { ContactComponent } from './contact/contact.component';

const routes: Routes = [
  {path: '', pathMatch:'full', redirectTo: '/home'},
  {path: 'home', component: HomeComponent},
  {path: 'view', canActivate: [usernameGuard], component: ViewComponent},
  {path: 'heatmap', canActivate: [usernameGuard], component: HeatmapComponent},
  {path: 'contact', component: ContactComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
