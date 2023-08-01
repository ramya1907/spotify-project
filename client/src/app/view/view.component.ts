import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MD5 } from 'crypto-js';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})

export class ViewComponent implements OnInit {
  token: string = '';
  apiKey = '846e19279fa31e6d74cad5d88e4a1a1f';
  apiSignature: string = '';
  secret = 'fd0bd87f719be98c8aeb80508a5d0ba4';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if ('token' in params) {
        this.token = params['token'];

    const backendApiUrl = 'https://melo-data-99991ac107b1.herokuapp.com/';

    // Make the API request to validate the access token
    this.http.get<any>(`${backendApiUrl}/api/validate-token?token=${this.token}`).subscribe(
      (response) => {
        if (response.authenticated) {
          // Authentication is successful
          const username = response.username;
          console.log('User authenticated:', username);

          // Store the username or take further actions in your Angular app as needed.
        } else {
          // Authentication failed
          console.log('Authentication failed');
        }
      },
       (error) => {
          console.log('Error occurred during authentication:', error);
        }
      );
    
        const cookieName = 'access_token';
        const expirationDays = 7;
        this.cookieService.set(cookieName, this.token, expirationDays, '/');

        const parameters = {
          api_key: this.apiKey,
          method: 'auth.getSession',
          token: this.token,
        } as { [key: string]: string };

        const sortedParamsString = Object.keys(parameters)
          .sort()
          .map((key) => `${key}${parameters[key]}`)
          .join('');

        const signatureString = sortedParamsString + this.secret;

        this.apiSignature = MD5(signatureString).toString();

        const requestBody = {
          api_key: this.apiKey,
          token: this.token,
          api_sig: this.apiSignature,
        };

        const httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
        };

        const lastFmApiUrl = 'http://ws.audioscrobbler.com/2.0/';

        // Make the POST request to fetch the web service session

        this.http
          .post<any>(
            `${lastFmApiUrl}?method=auth.getSession`,
            this.urlEncode(requestBody),
            httpOptions
          )
          .subscribe((response) => {
            // Handle the response from the Last.fm API
            if (response.session && response.session.key) {
              // The web service session key is available in response.session.key
              console.log('Web service session key:', response.session.key);
              this.cookieService.set('sessionKey', response.session.key, { expires: 7 }); 
            } else {
              console.log('Web service session key is unavailable');
            }
          });
      } else {
        console.log('Token missing or not defined');
      }
    });
  }

  // Helper function to URL encode an object's properties
  private urlEncode(obj: any): string {
    return Object.keys(obj)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
      )
      .join('&');
  }
}
