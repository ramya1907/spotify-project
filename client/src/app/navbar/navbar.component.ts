import { Component, OnInit, HostListener, ChangeDetectorRef, Renderer2} from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  username: string = '';
  userExists: boolean = false;

  constructor(private router: Router, private cdr: ChangeDetectorRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
      this.userExists = true;
      this.cdr.detectChanges
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 55;
  }

 
  signOut() {
    localStorage.removeItem('username');
    this.username = '';
    this.userExists = false;

    this.cdr.detectChanges();

    this.router.navigate(['/home']);
  }

  signInAndScroll() {
    this.router.navigate(['/home']).then(() => {
      const element = this.renderer.selectRootElement('#temp_section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}
