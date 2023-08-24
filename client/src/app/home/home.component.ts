import {
  Component,
  HostListener,
  Renderer2,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { LastFmService } from 'src/last-fm.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('viewStatsText', { static: true }) viewStatsText!: ElementRef;
  @ViewChild('inputContainer') inputContainer!: ElementRef;
  @ViewChild('userDisplay') userDisplay!: ElementRef;
  @ViewChild('usernameContent', { static: true }) usernameContent!: ElementRef;

  title = 'Home';

  username: string = '';
  userExists = false;
  userEntered = true;
  userVerified = true;

  isScrolled = false;

  constructor(
    private router: Router,
    private lastFmService: LastFmService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    window.addEventListener('scroll', this.handleScroll.bind(this));
    window.addEventListener('scroll', this.handleScroll1.bind(this));
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
      this.userExists = true;
      this.userVerified = true;
    }
  }

  ngAfterViewInit(): void {
    window.addEventListener('scroll', this.handleScroll1.bind(this));
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    const scrollTop =
      event.target.documentElement.scrollTop || event.target.body.scrollTop;

    const viewStatsTriggerPoint = 50;

    if (scrollTop > viewStatsTriggerPoint) {
      this.renderer.addClass(
        this.viewStatsText.nativeElement,
        'view-stats-visible'
      );
    } else {
      this.renderer.removeClass(
        this.viewStatsText.nativeElement,
        'view-stats-visible'
      );
    }
  }

  handleScroll() {
    if (this.usernameContent && this.usernameContent.nativeElement) {
      const usernameContentTop = this.usernameContent.nativeElement.offsetTop;
      const scrollPosition = window.scrollY;

      if (scrollPosition >= usernameContentTop) {
        this.inputContainer.nativeElement.style.display = 'block';
      } else {
        this.inputContainer.nativeElement.style.display = 'none';
      }
    }
  }

  handleScroll1() {
    if (this.usernameContent && this.usernameContent.nativeElement) {
      const usernameContentTop = this.usernameContent.nativeElement.offsetTop;
      const scrollPosition = window.scrollY;

      if (scrollPosition >= usernameContentTop) {
        this.userDisplay.nativeElement.style.display = 'block';
      } else {
        this.userDisplay.nativeElement.style.display = 'none';
      }
    }
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
        this.userExists = true;
      } else {
        this.userExists = false;
        this.userVerified = false;
        console.log('Username does not exist.');
      }
    } catch (error) {
      console.error('Error checking username:', error);
    }
  }

  //change view of home screen is user exists
  //give option to change user or sign out

  setUsername() {
    this.userVerified = true;
    const username = this.username;
    this.checkInput(username);
    if (this.userEntered) {
      this.checkUsernameAndNavigate();
    }
  }

  submitUsername() {
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

  signOut() {
    localStorage.removeItem('username'); // Remove the stored username from localStorage
    this.username = ''; // Clear the username variable in your component
  }
}
