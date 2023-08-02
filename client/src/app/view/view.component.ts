import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MD5 } from 'crypto-js';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})

export class ViewComponent implements OnInit {


  isInitialized: boolean = false;

  loading: boolean = false;
  token: string = '';
  apiKey = '846e19279fa31e6d74cad5d88e4a1a1f';
  apiSignature: string = '';
  secret = 'fd0bd87f719be98c8aeb80508a5d0ba4';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) {}

  openStats(){
    this.router.navigate(['/stats']);
  }


  ngOnInit(): void {
    this.loading = true;
    this.isInitialized = true;
    console.log("It is loadin");
    this.route.queryParams.subscribe((params) => {
      if ('token' in params) {
        this.token = params['token'];
        this.handleTokenValidation(this.token);
      } else {
        
        console.log('Token missing or not defined');
        this.loading = false;
      }
    });
    console.log("It is done loadin yay");
    this.loading = false;
  }

  private handleTokenValidation(token: string): void {
    const backendApiUrl = 'https://melo-data-99991ac107b1.herokuapp.com';

    this.validateAccessToken(token, backendApiUrl);
  }

  private validateAccessToken(token: string, backendApiUrl: string): void {
    this.http
      .get<any>(`${backendApiUrl}/api/validate-token?token=${token}`)
      .subscribe(
        (response) => {
          if (response.authenticated) {
            this.handleSuccessfulAuthentication(response.username);
            this.storeAccessToken(token);
            this.createApiSignature(token);
            this.createSessionKey(token);
          } else {
            console.log('Authentication failed');
          }
          console.log("It is done loadin");
          this.loading = false;
        },
        (error) => {
          console.log('Error occurred during authentication:', error);
          console.log("It is done loadin");
          this.loading = false;
    
        }
      );
  }

  private handleSuccessfulAuthentication(username: string): void {
    console.log('User authenticated:', username);
  }

  private storeAccessToken(token: string): void {
    const cookieName = 'access_token';
    const expirationDays = 7;
    this.cookieService.set(cookieName, token, expirationDays, '/');
  }

  private createApiSignature(token: string): void {
    const parameters = {
      api_key: this.apiKey,
      method: 'auth.getSession',
      token: token,
    } as { [key: string]: string };

    const sortedParamsString = Object.keys(parameters)
      .sort()
      .map((key) => `${key}${parameters[key]}`)
      .join('');

    const signatureString = sortedParamsString + this.secret;

    this.apiSignature = MD5(signatureString).toString();
  }

  private createSessionKey(token: string): void {
    const requestBody = {
      api_key: this.apiKey,
      token: token,
      api_sig: this.apiSignature,
    };

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    };

    const lastFmApiUrl = 'http://ws.audioscrobbler.com/2.0/';

    this.http
      .post<any>(
        `${lastFmApiUrl}?method=auth.getSession`,
        this.urlEncode(requestBody),
        httpOptions
      )
      .subscribe((response) => {
        if (response.session && response.session.key) {
          this.handleSessionKeyCreation(response.session.key);
        }
        else {
          console.log('Web service session key is unavailable');
        } 
      });
  }

  private handleSessionKeyCreation(sessionKey: string): void {
    console.log('Web service session key:', sessionKey);
    this.cookieService.set('sessionKey', sessionKey, { expires: 7 });
  }

  private urlEncode(obj: any): string {
    return Object.keys(obj)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
      )
      .join('&');
  }
}
