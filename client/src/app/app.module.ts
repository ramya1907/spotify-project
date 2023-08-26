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
import { LoadingIndicatorComponent } from './loading-indicator/loading-indicator.component';
import { HeatmapComponent } from './heatmap/heatmap.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DatePipe } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ViewComponent,
    LoadingIndicatorComponent,
    HeatmapComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxChartsModule
  ],
  providers: [LastFmService, DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
