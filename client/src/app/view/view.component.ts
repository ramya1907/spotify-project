import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LastFmService } from 'src/last-fm.service';

//i think get recent tracks, gets the first date at the end- useful for knowing when u first found an artist

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  username = '';
  artistNames: string[] = [];
  isLoading: boolean = false;

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
  showFoundArtist = false;
  emptyArray = false;
  showUnlistenedSongs = false;
  viewUnlistened = false;
  songPlayCounts: any[] = [];
  barChartData: { name: string; value: number }[] = [];


  unlistenedSongs: any[] = [];

  artistName: string = '';

  artistExists = true;
  artistEntered = true;

  pie_percent: number = 0;

  earliestListenDate: string| undefined;
  earliestListenSongName: string = '';

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
          this.isLoading = false;
          console.log('loading error at check artist');
        }
      },
      error: (error) => {
        console.error('Error checking artist name:', error);
        this.isLoading = false;
        console.log('loading error');
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
      this.totalSongsVal = this.filteredTracks.length;
      this.isLoading = false;
      console.log("It's all done");
    } catch (error) {
      console.error('Error fetching artist tracks:', error);
      this.isLoading = false;
      console.log('Loading status:', this.isLoading);
      console.log('loading error');
    }
  }

  async getUserListeningHistory(artistName: string) {
    let page = 1;
    const limit = 1000;
    const playCounts: Map<string, number> = new Map();
    let earliestListenTimestamp: number = Number.MAX_SAFE_INTEGER;

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

              const timestamp = Number(track.date.uts);
              if (timestamp < earliestListenTimestamp) {
                earliestListenTimestamp = timestamp;
                this.earliestListenSongName = track.name;
              }
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
      this.isLoading = false;
    }

    this.convertToDate(earliestListenTimestamp);

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
      this.isLoading = false;
      return;
    }
    //display bar chart
    this.songPlayCounts.map((elem) =>
      this.barChartData.push({ name: elem.name, value: elem.playcount })
    );
    this.showBarChart = true;

    this.uniqueSongs = Array.from(playCounts.keys());
    this.unlistenedSongs = this.filteredTracks.filter(
      (song) => !this.uniqueSongs.includes(song)
    );
    console.log('Unlistened songs are', this.unlistenedSongs);
    this.viewUnlistened = true;
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
      'sped up',
      '(instrumental)',
      'demo',
      '(album mix)',
      'live at',
      '(live',
      '(official',
      '(cover)',
      '(cover',
      'live at',
    ];

    return excludedPatterns.some((pattern) =>
      normalizedTrackName.includes(pattern)
    );
  }

  displayStats() {
    this.isLoading = true;
    console.log('Loading status: ', this.isLoading);
    this.artistExists = true;
    this.artistEntered = true;
    this.emptyArray = false;
    this.showUnlistenedSongs = false;
    this.showFoundArtist = false;

    if (!this.artistName) {
      this.artistEntered = false;
      this.isLoading = false;
      console.log('Loading status: ', this.isLoading);
      console.log('loading error');
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
    this.pie_percent = Math.round(
      (this.listenedSongsVal / this.totalSongsVal) * 100
    );
    this.showPieChart = true;
  }

  removeVariationKeywords(songName: string): string {
    const variationKeywords = [
      'lyrics',
      'music video',
      'lyrics video',
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
      '( live )',
      '(live)',
      '(clean)',
      '[live]',
      'version',
      '(cover)',
    ];

    const variationPattern = new RegExp(
      `\\s*\\((${variationKeywords.join('|')})\\)`,
      'i'
    );

    return songName.replace(variationPattern, '').trim();
  }

  cleanText(songList: Set<string>) {
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

  toggleUnlistenedSongs() {
    this.showUnlistenedSongs = !this.showUnlistenedSongs;
  }

  convertToDate(earliestListenTimestamp: number) {
    const earliestListenDate = new Date(earliestListenTimestamp * 1000); 
    this.earliestListenDate = earliestListenDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    this.showFoundArtist = true;
  }
}
