import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {

  title = 'Home';
  
  username: string = '';

  constructor(private router: Router) {} 

  fetchUserData(): void {
    console.log(`${this.username} is the username`);
   
    this.router.navigate(['/view']);  
  }
}
