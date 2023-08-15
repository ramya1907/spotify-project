import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LastFmService } from 'src/last-fm.service';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  username = '';
  artistNames: string[] = [];

  constructor(private http: HttpClient, private lastFmService: LastFmService) {}

  ngOnInit() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    }
  }

  apiKey: string = '846e19279fa31e6d74cad5d88e4a1a1f';
  lastFmApiUrl = 'https://ws.audioscrobbler.com/2.0/';

  fetchedTracks: any[] = [];
  userListeningHistory: any[] = [];
  filteredTracks: string[] = [];

  uniqueSongs: string[] = [];

  totalSongsVal: number = 0;
  listenedSongsVal: number = 0;
  unlistenedSongsVal: number = 0;

  chartData: any[] = [];
  showPieChart = false;
  showBarChart = false;
  emptyArray = false;
  songPlayCounts: any[] = [];
  barChartData: { name: string; value: number }[] = [];

  artistName: string = '';

  artistExists = true;
  artistEntered = true;

  //-----------------------------------------------------

  checkArtistandRetrieveData(artistName: string) {
    this.lastFmService.checkArtistNameExists(artistName).subscribe({
      next: (artistExists) => {
        if (artistExists) {
          this.artistExists = true;
          this.getUserListeningHistory(this.artistName.toLowerCase());
        } else {
          this.artistExists = false;
          console.log(`Artist name is misspelled or doesn't exist!`);
        }
      },
      error: (error) => {
        console.error('Error checking artist name:', error);
      },
    });
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

      this.filteredTracks = this.cleanText(allTracks);

      // Array.from(allTracks).filter(
      //   (track: string) => !this.isLiveOrRemix(track.toLowerCase())
      // );

      // this.filteredTracks = this.filteredTracks.map(
      //   this.removeVariationKeywords
      // );

      this.totalSongsVal = this.filteredTracks.length;

      console.log('Filtered tracks:', this.filteredTracks);
    } catch (error) {
      console.error('Error fetching artist tracks:', error);
    }
  }

  async getUserListeningHistory(artistName: string) {
    let page = 1;
    const limit = 1000;
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
    } catch (error) {
      console.error('Error retrieving recent tracks:', error);
    }

    this.songPlayCounts = Array.from(playCounts.entries()).map(
      ([name, playcount]) => ({
        name,
        playcount,
      })
    );

    //decreasing order of play count
    this.songPlayCounts.sort((a, b) => b.playcount - a.playcount);

    //empty array
    if (this.songPlayCounts.length === 0) {
      this.emptyArray = true;
      console.log('No songs listened to by this artist');
      return;
    }
    //display bar chart
    this.songPlayCounts.map((elem) =>
      this.barChartData.push({ name: elem.name, value: elem.playcount })
    );
    console.log('Length of barchart dataset:', this.barChartData.length);
    this.showBarChart = true;

    this.uniqueSongs = Array.from(playCounts.keys());
    this.listenedSongsVal = this.uniqueSongs.length;

    this.displayPieChart();

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
      'sped up',
      '(instrumental)',
      'demo',
      '(album mix)',
      'live at',
      '(live',
      '(official',
    ];

    return excludedPatterns.some((pattern) =>
      normalizedTrackName.includes(pattern)
    );
  }

  displayStats() {
    this.artistExists = true;
    this.artistEntered = true;
    this.emptyArray = false;

    if (!this.artistName) {
      this.artistEntered = false;
    } else {
      this.artistEntered = true;
      this.checkArtistandRetrieveData(this.artistName);
      this.showBarChart = false;
      this.showPieChart = false;
      this.getArtistTracks(this.artistName.toLowerCase());
    }
  }

  displayPieChart() {
    this.unlistenedSongsVal = this.totalSongsVal - this.listenedSongsVal;
    this.chartData = [
      { name: 'Listened', value: this.listenedSongsVal },
      { name: 'Unlistened', value: this.unlistenedSongsVal },
    ];
    this.showPieChart = true;
  }

  removeVariationKeywords(songName: string): string {
    const variationKeywords = [
      'lyrics',
      'music video',
      'lyrics video',
      'mix',
      'Live',
      'Mix',
      'mix',
      'official video',
      'visualizer',
      'single cut',
      'Audio',
      'audio',
      'official audio',
      'cover',
      'original mix',
      'clean',
      'remastered',
      '[explicit]',
      '(demo)',
    ];

    const variationPattern = new RegExp(
      `\\s*\\((${variationKeywords.join('|')})\\)`,
      'i'
    );
    return songName.replace(variationPattern, '').trim();
  }

  cleanText(songList: Set<string>) {
    // this.filteredTracks = Array.from(songList)
    //   .map((track: string) => this.removeVariationKeywords(track.toLowerCase()))
    //   .filter((track: string) => !this.isLiveOrRemix(track.toLowerCase()));

    // const songNamesSet = new Set<string>(this.filteredTracks);
    // this.filteredTracks = Array.from(songNamesSet);
    // return this.filteredTracks

    const filteredSongs: string[] = [];

    const songNamesSet = new Set<string>();
    for (const track of songList) {
      const cleanTrack = this.removeVariationKeywords(track.toLowerCase());
      let shouldAdd = true;

      for (const addedSong of filteredSongs) {
        if (cleanTrack.includes(addedSong)) {
          shouldAdd = false;
          break;
        }
      }

      if (shouldAdd) {
        filteredSongs.push(cleanTrack);
        songNamesSet.add(cleanTrack);
      }
    }

    this.filteredTracks = Array.from(songNamesSet).filter(
      (track: string) => !this.isLiveOrRemix(track)
    );

    return this.filteredTracks;
  }
}
