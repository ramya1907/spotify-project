import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserService } from 'src/user.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {

  username = '';
  artistNames: string[] = [];

  constructor(private http: HttpClient, private userService: UserService) {}

  ngOnInit() {
    this.userService.username$.subscribe((username) => {
      this.username = username;
    });
  }

  apiKey: string = '846e19279fa31e6d74cad5d88e4a1a1f';
  lastFmApiUrl = 'https://ws.audioscrobbler.com/2.0/';

  fetchedTracks: any[] = [];
  userListeningHistory: any[] = [];
  filteredTracks: string[] = [];

  uniqueSongs: string[] = [];

  totalSongsVal : number = 0;
  listenedSongsVal : number = 0;
  unlistenedSongsVal : number = 0;
  chartData: any[] = [];
  showPieChart = false;
  songPlayCounts: any[] = [];
  

  artistName: string = '';

  //-----------------------------------------------------

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

      this.totalSongsVal = this.filteredTracks.length;

      console.log('Filtered tracks:', this.filteredTracks);
    
    } catch (error) {
      console.error('Error fetching artist tracks:', error);
    }
  }

  clickButton() {
    if (!this.artistName) {
      console.log('Artist name is empty!');
    }

    this.getArtistTracks(this.artistName);
  }

  async getUserListeningHistory(artistName: string) {
    let page = 1;
    let allTracks: any[] = [];
    const limit = 200;
    const playCounts: Map<string, number> = new Map();

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
            if (track.artist['#text'].toLowerCase() === artistName) {
              allTracks.push(track.name);
              const songKey = track.name.toLowerCase();
              playCounts.set(songKey, (playCounts.get(songKey) || 0) + 1);
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
    } catch (error) {
      console.error('Error retrieving recent tracks:', error);
    }

    this.songPlayCounts = Array.from(playCounts.entries()).map(
      ([name, playcount]) => ({
        name,
        playcount,
      })
    );
    this.uniqueSongs = Array.from(playCounts.keys());
    this.listenedSongsVal = this.uniqueSongs.length;

    console.log('These are the songs and their counts', this.songPlayCounts);
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
      '(live',
    ];

    return excludedPatterns.some((pattern) =>
      normalizedTrackName.includes(pattern)
    );
  }

  clickButton2() {
    if (!this.artistName) {
      console.log('Artist name is empty!');
    }
    this.getUserListeningHistory(this.artistName);
  }

  clickButton3() {
    if (!this.artistName) {
      console.log('Artist name is empty!');
    }
    this.getArtistTracks(this.artistName.toLowerCase());
    this.getUserListeningHistory(this.artistName.toLowerCase());
  }

  displayPieChart() {
    this.unlistenedSongsVal = this.totalSongsVal - this.listenedSongsVal;
    this.chartData = [      
      { name: 'Listened', value: this.listenedSongsVal },
      { name: 'Unlistened', value: this.unlistenedSongsVal },
    ];
    this.showPieChart = true; 
  }
}
