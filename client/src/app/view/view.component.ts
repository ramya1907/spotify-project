import { Component } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent{

  constructor(private http: HttpClient) {}

  apiKey: string = '846e19279fa31e6d74cad5d88e4a1a1f';
  fetchedTracks: any[] = [];

  async getTopTracks(artistName: string) {
    const tracksPerPage = 50;
    const totalPages = 2;
    const lastFmApiUrl = 'http://ws.audioscrobbler.com/2.0/';
    let allTracks: any[] = [];

    try {
      for (let page = 1; page <= totalPages; page++) {
        const response = await firstValueFrom(this.http.get<any>(`${lastFmApiUrl}`, {
          params: {
            method: 'artist.getTopTracks',
            artist: encodeURIComponent(artistName),
            page: page.toString(),
            api_key: this.apiKey,
            limit: tracksPerPage.toString(),
            format: 'json'
          }
        }));

        if (response.toptracks && response.toptracks.track) {
          for (const track of response.toptracks.track) {
            if (track.name) {
              allTracks.push(track.name);
            }
          }
        }

    }

    this.fetchedTracks = allTracks;

  }
    catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  }


  clickButton() {
    this.getTopTracks("Madonna");
  }
}
