import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LastFmService } from 'src/last-fm.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  title = 'Home';

  username: string = '';
  userExists = true;
  userEntered = true;

  constructor(
    private router: Router,
    private lastFmService: LastFmService
  ) {}

  checkInput(username: string) {
    if (!username) {
      this.userEntered = false;
    }
    else 
      {
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

  fetchArtistData(){
    if(this.userExists)
    {this.router.navigate(['/view']);}  
    
  }

  viewHeatMap(){
    if(this.userExists)
    {this.router.navigate(['/heatmap']);}  

  }
}
