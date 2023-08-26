import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ScrollService } from '../scroll.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  username: string = '';
  userExists: boolean = false;

  constructor(private router: Router, private scrollService: ScrollService) {}

  ngOnInit(): void {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
      this.userExists = true;
    }
  }

 
  signOut() {
    localStorage.removeItem('username');
    this.username = '';
    this.userExists = false;
    this.router.navigate(['/home']);
  }
}
