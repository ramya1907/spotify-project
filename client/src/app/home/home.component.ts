import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent {

  title = 'frontEnd';
  message: any;

  constructor(private apiService: ApiService, private router: Router) {} 

  // ngOnInit() {
  //   this.apiService.getMessage().subscribe(data => {
  //       this.message = data;
  //   });
  // } //might remove this method later

  redirectToLastFmAuth() {
  
    const apiKey = '846e19279fa31e6d74cad5d88e4a1a1f';
    const lastFmAuthUrl = `http://www.last.fm/api/auth/?api_key=${apiKey}&cb=https://melo-data-99991ac107b1.herokuapp.com/view`;

    
    window.location.href = lastFmAuthUrl;
  }
}
