// last-fm.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, firstValueFrom, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LastFmService {
  private lastFmApiUrl = 'https://ws.audioscrobbler.com/2.0/';
  private apiKey = '';

  constructor(private http: HttpClient) {}

  async checkUsernameExists(username: string): Promise<boolean> {
    const params = {
      method: 'user.getInfo',
      user: username,
      api_key: this.apiKey,
      format: 'json',
    };

    try {
      const response = await firstValueFrom(
        this.http.get<any>(this.lastFmApiUrl, { params })
      );
      return response && !response.error;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  }

  checkArtistNameExists(artistName: string): Observable<boolean> {
    const params = {
      method: 'artist.getInfo',
      artist: artistName,
      api_key: this.apiKey,
      format: 'json',
    };

    return this.http.get<any>(this.lastFmApiUrl, { params }).pipe(
      map((response) => !response.error),
      catchError((error) => {
        console.error('Error checking artist name:', error);
        return of(false);
      })
    );
  }
}
