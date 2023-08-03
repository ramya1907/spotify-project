import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  apiKey = '846e19279fa31e6d74cad5d88e4a1a1f';

  constructor(private route: ActivatedRoute, private cookieService: CookieService) {}

  ngOnInit(): void {
    console.log('It is loadin');

    this.route.queryParams.subscribe((params) => {
      const token = params['token'];

      if (token) {
        
        this.cookieService.set('access_token', token);
        console.log('Access token:', token);
      } else {
        console.log('Token missing or not defined');
      }
    });
  }
}
