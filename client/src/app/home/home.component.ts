import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {

  title = 'Home';
  
  username: string = '';

  constructor(private router: Router, private userService: UserService) {} 

  // fetchUserData(): void {
  //   console.log(`${this.username} is the username`);
   
  //   this.router.navigate(['/view']);  
  // }

  setUsername() {
    const username = this.username; // Replace with your actual username
    this.userService.setUsername(username);
    console.log(`${this.username} is the username`);

    this.router.navigate(['/view']);  
  }
}
