import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from './home/home.component';
import { ViewComponent } from './view/view.component';
import { FormsModule } from '@angular/forms';
import { LastFmService } from 'src/last-fm.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { ContactComponent } from './contact/contact.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ViewComponent,
    HeatmapComponent,
    NavbarComponent,
    FooterComponent,
    ContactComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxChartsModule
  ],
  providers: [LastFmService],
  bootstrap: [AppComponent]
})
export class AppModule { }
