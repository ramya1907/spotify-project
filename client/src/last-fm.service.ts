// last-fm.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LastFmService {
  private lastFmApiUrl = 'https://ws.audioscrobbler.com/2.0/';
  private apiKey = '846e19279fa31e6d74cad5d88e4a1a1f';

  constructor(private http: HttpClient) {}

  async checkUsernameExists(username: string): Promise<boolean> {
    const params = {
      method: 'user.getInfo',
      user: username,
      api_key: this.apiKey,
      format: 'json'
    };

    try {
      const response = await firstValueFrom(this.http.get<any>(this.lastFmApiUrl, { params }));
      return response && !response.error;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }



}
