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

  
  redirectToLastFmAuth() {
    // Replace 'YOUR_API_KEY' with your actual Last.fm API key
    const apiKey = '846e19279fa31e6d74cad5d88e4a1a1f';
    const lastFmAuthUrl = `http://www.last.fm/api/auth/?api_key=${apiKey}&cb=https://melo-data-99991ac107b1.herokuapp.com/view`;

    // Redirect the user to the Last.fm authentication page
    window.location.href = lastFmAuthUrl;
  }

  callback() {
    this.router.navigate(['/view']);
  }

}
