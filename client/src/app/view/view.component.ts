import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent {
  constructor(private http: HttpClient) {}

  apiKey: string = '846e19279fa31e6d74cad5d88e4a1a1f';
  lastFmApiUrl = 'http://ws.audioscrobbler.com/2.0/';
  fetchedTracks: any[] = [];
  userListeningHistory: any[] = [];
  username: string = 'ramyeow';
  filteredTracks: string[] = [];

  async getTop100Tracks(artistName: string) {
    const tracksPerPage = 50;
    const totalPages = 2;
    const desiredTrackCount = 100;
    let allTracks: any[] = [];

    try {
      let fetchedTrackCount = 0;

      for (let page = 1; page <= totalPages; page++) {
        const response = await firstValueFrom(
          this.http.get<any>(`${this.lastFmApiUrl}`, {
            params: {
              method: 'artist.getTopTracks',
              artist: artistName,
              page: page.toString(),
              api_key: this.apiKey,
              limit: tracksPerPage.toString(),
              format: 'json',
            },
          })
        );

        if (response.toptracks && response.toptracks.track) {
          for (const track of response.toptracks.track) {
            if (track.name && fetchedTrackCount < desiredTrackCount) {
              allTracks.push(track.name.toLowerCase());
              fetchedTrackCount++;

              if (fetchedTrackCount === desiredTrackCount) {
                break;
              }
            }
          }
        }
      }

      this.fetchedTracks = allTracks;
      console.log(this.fetchedTracks);
    } catch (error) {
      console.error('Error fetching top tracks:', error);
    }
  }

  async getArtistTracks(artistName: string) {
    const tracksPerPage = 100;
    let page = 1;
    let allTracks = new Set<string>();

    try {
      while (true) {
        const response = await firstValueFrom(
          this.http.get<any>(`${this.lastFmApiUrl}`, {
            params: {
              method: 'artist.getTopTracks',
              artist: artistName,
              page: page.toString(),
              api_key: this.apiKey,
              limit: tracksPerPage.toString(),
              format: 'json',
            },
          })
        );

        if (response.toptracks && response.toptracks.track) {
          for (const track of response.toptracks.track) {
            if (track.name.toLowerCase()) {
              allTracks.add(track.name);
            }
          }
        }

        if (response.toptracks.track.length < tracksPerPage) {
          break;
        }

        page++;
      }

      this.filteredTracks = Array.from(allTracks).filter(
        (track: string) => !this.isLiveOrRemix(track.toLowerCase())
      );

      console.log('Filtered tracks:', this.filteredTracks);
      console.log(
        `Fetched total ${this.filteredTracks.length} unique tracks (after filtering)`
      );
    } catch (error) {
      console.error('Error fetching artist tracks:', error);
    }
  }

  clickButton() {
    this.getArtistTracks('Lana Del Rey');
  }

  async getUserListeningHistory(artistName: string) {
    let page = 1;
    let allTracks: any[] = [];
    const limit = 200;

    try {
      while (true) {
        const response = await firstValueFrom(
          this.http.get<any>(`${this.lastFmApiUrl}`, {
            params: {
              method: 'user.getRecentTracks',
              user: this.username,
              api_key: this.apiKey,
              limit: limit.toString(),
              page: page.toString(),
              format: 'json',
            },
          })
        );

        if (response.recenttracks && response.recenttracks.track) {
          for (const track of response.recenttracks.track) {
            if (
              track.artist['#text'] === artistName)
            {
              allTracks.push(track.name);
              console.log(`${track.name} is added to the array`);
            }
          }
        }

          if (response.recenttracks.track.length < limit) {
            break;
          }
        
        page++;
      }
      this.userListeningHistory = allTracks;
      console.log('Complete Listening History:', this.userListeningHistory);
    } catch (error) {
      console.error('Error retrieving recent tracks:', error);
    }
  }

  private isLiveOrRemix(trackName: string): boolean {
    const normalizedTrackName = trackName.toLowerCase();
    const excludedPatterns = [
      'acoustic',
      'remix',
      'radio edit',
      'clean version',
      'live in',
      'radio mix',
      'live from',
      'club mix',
      '(clean)',
      'lyrics',
      '(live)',
      '[live]',
      '[explicit]',
      'remastered',
      'sped up',
      '(demo)',
      '(instrumental)',
      'demo',
      '(album mix)',
      'live at',
    ];

    return excludedPatterns.some((pattern) =>
      normalizedTrackName.includes(pattern)
    );
  }

  clickButton2() {
    this.getUserListeningHistory('Taylor Swift');
  }
}
