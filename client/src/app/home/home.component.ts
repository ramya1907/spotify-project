import {
  Component,
  HostListener,
  ElementRef,
  ViewChild,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { LastFmService } from 'src/last-fm.service';
import { ScrollService } from '../scroll.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit{
  @ViewChild('viewStatsText', { static: true }) viewStatsText!: ElementRef;
  @ViewChild('mainContainer') mainContainer!: ElementRef;
  @ViewChild('usernameContent', { static: true }) usernameContent!: ElementRef;
  @ViewChild('tempSection', { static: false}) tempSection!: ElementRef;

  title = 'Home';

  username: string = '';
  userExists = false;
  userEntered = true;
  userVerified = true;

  isScrolled = false;

  constructor(
    private router: Router,
    private lastFmService: LastFmService,
    private scrollService: ScrollService
  ) {}

  ngOnInit(): void {

    window.addEventListener('scroll', this.handleScroll.bind(this));
    
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
      this.userExists = true;
    }
    else{
      this.userExists=false;
    }
    
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 55;
  }

  handleScroll() {
    if (this.usernameContent && this.usernameContent.nativeElement) {
      const usernameContentTop = this.usernameContent.nativeElement.offsetTop;
      const scrollPosition = window.scrollY;

      if (scrollPosition >= usernameContentTop) {
        this.mainContainer.nativeElement.style.display = 'block';
      } else {
        this.mainContainer.nativeElement.style.display = 'none';
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
    localStorage.removeItem('username'); 
    this.username = ''; 
    this.userExists = false;
    this.router.navigate(['/home']);
  }
}
