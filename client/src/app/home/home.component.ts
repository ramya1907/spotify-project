import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  title = 'frontEnd';
  message: any;

  constructor(private apiService: ApiService, private router: Router) {} // Inject the Router in the constructor

  ngOnInit() {
    this.apiService.getMessage().subscribe(data => {
        this.message = data;
    });
  }

  signIn() {
    // Implement the logic to redirect the user to the Last.fm sign-in page
    // For example, open it in a new tab/window:
    window.open('https://www.last.fm/signin', '_blank');

    // After the user signs in and the callback is received, navigate to the callback page
    this.router.navigate(['/view']); // Make sure 'callback' matches the path specified in AppRoutingModule
  
  }

  callback() {
    this.router.navigate(['/view']);
  }

}
