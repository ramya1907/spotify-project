import { Component, HostListener, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LastFmService } from 'src/last-fm.service';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('parallaxAnimation', [
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('0.5s ease'),
      ]),
    ]),
  ],
})
export class HomeComponent {

  @ViewChild('viewStatsText', { static: true }) viewStatsText!: ElementRef;
  parallaxVisible = false;

  title = 'Home';

  username: string = '';
  userExists = true;
  userEntered = true;

  constructor(private router: Router, private lastFmService: LastFmService, private renderer: Renderer2) {}

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    const scrollTop =
      event.target.documentElement.scrollTop || event.target.body.scrollTop;
    console.log('Scroll Top:', scrollTop);
    const parallaxTriggerPoint = 20;
    const viewStatsTriggerPoint = 50; 
    if (scrollTop > viewStatsTriggerPoint) {
      this.renderer.addClass(this.viewStatsText.nativeElement, 'view-stats-visible');
    } else {
      this.renderer.removeClass(this.viewStatsText.nativeElement, 'view-stats-visible');
    }

    // this.parallaxVisible = scrollTop > parallaxTriggerPoint;
  }

  checkInput(username: string) {
    if (!username) {
      this.userEntered = false;
    } else {
      this.userEntered = true;
    }
  }
  async checkUsernameAndNavigate() {
    try {
      const userExists = await this.lastFmService.checkUsernameExists(
        this.username
      );
      if (userExists) {
        this.submitUsername();
        console.log(`Username ${this.username} exists!`);
      } else {
        this.userExists = false;
        console.log('Username does not exist.');
      }
    } catch (error) {
      console.error('Error checking username:', error);
    }
  }

  //change view of home screen is user exists
  //give option to change user or sign out

  setUsername() {
    const username = this.username; // Replace with your actual username
    this.checkInput(username);
    if (this.userEntered) {
      this.checkUsernameAndNavigate();
    }
  }

  submitUsername() {
    // Store the username in localStorage
    localStorage.setItem('username', this.username);
  }

  fetchArtistData() {
    if (this.userExists) {
      this.router.navigate(['/view']);
    }
  }

  viewHeatMap() {
    if (this.userExists) {
      this.router.navigate(['/heatmap']);
    }
  }
}
