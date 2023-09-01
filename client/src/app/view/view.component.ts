import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { LastFmService } from 'src/last-fm.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  @ViewChild('parallaxSections') parallaxSections!: ElementRef;

  username = '';
  artistNames: string[] = [];
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private lastFmService: LastFmService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {

    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    }
    this.cdRef.detectChanges();
  }

  apiKey: string = '846e19279fa31e6d74cad5d88e4a1a1f';
  lastFmApiUrl = 'https://ws.audioscrobbler.com/2.0/';

  fetchedTracks: any[] = [];
  userListeningHistory: any[] = [];
  filteredTracks: string[] = [];

  uniqueSongs: string[] = [];

  chartData: any[] = [];

  songPlayCounts: any[] = [];
  barChartData: { name: string; value: number }[] = [];

  unlistenedSongs: any[] = [];

  artistName: string = '';

  artistExists = true;
  artistEntered = true;
  isLoading1: boolean = false;
  displayReady: boolean = false;
  showPieChart = false;
  showBarChart = false;
  showFoundArtist = false;
  emptyArray = false;
  listUnlistenedSongs = false;
  viewUnlistened = false;

  totalSongsVal: number = 0;
  listenedSongsVal: number = 0;
  unlistenedSongsVal: number = 0;
  pie_percent: string = '';
  earliestListenDate: string | undefined;
  earliestListenSongName: string = '';

  trackToAlbum: { albumName: string; albumImage: string; songs: string[] }[] =
    [];

  //-----------------------------------------------------

  checkArtistandRetrieveData(artistName: string) {
    this.lastFmService.checkArtistNameExists(artistName).subscribe({
      next: (artistExists) => {
        if (artistExists) {
          this.artistExists = true;
        } else {
          this.artistExists = false;
          this.isLoading = false;
          return;
        }
      },
      error: (error) => {
        console.error('Error checking artist name:', error);
        this.isLoading = false;
      },
    });
  }

  async getArtistTracks(artistName: string) {
    const tracksPerPage = 100;
    let page = 1;
    let allTracks = new Set<string>();

    artistName = artistName.toLowerCase().replace(/\s/g, '');

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
    } catch (error) {
      console.error('Error fetching artist tracks:', error);
      this.isLoading = false;
    }
  }

  async getUserListeningHistory(artistName: string) {
    let page = 1;
    const limit = 1000;
    const playCounts: Map<string, number> = new Map();
    let earliestListenTimestamp: number = Number.MAX_SAFE_INTEGER;
    artistName = artistName.toLowerCase().replace(/\s/g, '').replace(/\./g, '');
    console.log("Cleaned artist name", artistName);

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
            const apiResponseArtist = track.artist['#text'].toLowerCase().replace(/\s/g, '').replace(/\./g, '');
            console.log("API artist name", apiResponseArtist);
            if (apiResponseArtist === artistName) {     
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

    await this.convertToDate(earliestListenTimestamp);

    this.songPlayCounts = Array.from(playCounts.entries()).map(
      ([name, playcount]) => ({
        name,
        playcount,
      })
    );

    //empty array
    if (this.songPlayCounts.length === 0) {
      this.emptyArray = true;
      return;
    }

    //decreasing order of play count
    this.songPlayCounts.sort((a, b) => b.playcount - a.playcount);
    this.uniqueSongs = Array.from(playCounts.keys());
  }

  helperUnlistenedSongs() {
    this.unlistenedSongs = this.filteredTracks.filter(
      (song) => !this.uniqueSongs.includes(song)
    );

    this.listenedSongsVal = this.uniqueSongs.length;
  }

  displayBarChart() {
    this.barChartData = [];
    this.songPlayCounts.map((elem) =>
      this.barChartData.push({ name: elem.name, value: elem.playcount })
    );
    this.showBarChart = true;
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

  async displayStats() {
    this.isLoading = true;
    this.artistExists = true;
    this.artistEntered = true;
    this.emptyArray = false;
    this.showFoundArtist = false;
    this.showBarChart = false;
    this.showPieChart = false;
    this.displayReady = false;
    this.viewUnlistened = false;
    this.listUnlistenedSongs = false;

    if (!this.artistName) {
      this.artistEntered = false;
      this.isLoading = false;
      return;
    }

    this.checkArtistandRetrieveData(this.artistName);

    try { 
      await this.getArtistTracks(this.artistName.toLowerCase());
      await this.getUserListeningHistory(this.artistName.toLowerCase());
      console.log('Unique songs are:', this.uniqueSongs);
      this.displayBarChart();
      this.helperUnlistenedSongs();
      console.log('Unlistened songs are', this.unlistenedSongs);
      console.log('These are the songs and their counts', this.songPlayCounts);
      this.displayPieChart();
     
     
    } catch (error) {
      console.error('Error during retrieval and display:', error);
    } finally {
      console.log("It's all done");
      if(this.emptyArray){
        this.displayReady = false;
        this.viewUnlistened = false;
        this.isLoading = false;
        return;
      }
      this.isLoading = false;

      this.displayReady = true;
      this.viewUnlistened = true;
    }
  }

  displayPieChart() {
    this.unlistenedSongsVal = this.totalSongsVal - this.listenedSongsVal;
    this.chartData = [
      { name: 'Listened', value: this.listenedSongsVal },
      { name: 'Unlistened', value: this.unlistenedSongsVal },
    ];
    this.pie_percent = (
      (this.listenedSongsVal / this.totalSongsVal) * 100
    ).toFixed(2);
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
    let filteredSongs: string[] = [];

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

    filteredSongs = Array.from(songNamesSet).filter(
      (track: string) => !this.isLiveOrRemix(track)
    );

    return filteredSongs;
  }

  async toggleUnlistenedSongs() {
    this.isLoading1 = true;
    await this.organizeIntoAlbums();
    this.listUnlistenedSongs = true;
    this.isLoading1 = false;
  }

  async convertToDate(earliestListenTimestamp: number) {
    const earliestListenDate = new Date(earliestListenTimestamp * 1000);
    this.earliestListenDate = earliestListenDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    this.showFoundArtist = true;
  }

  async organizeIntoAlbums() {
    for (const song of this.unlistenedSongs) {
      try {
        const response = await firstValueFrom(
          this.http.get<any>(`${this.lastFmApiUrl}`, {
            params: {
              method: 'track.getInfo',
              track: song,
              artist: this.artistName,
              api_key: this.apiKey,
              format: 'json',
            },
          })
        );

        if (response.track && response.track.album) {
          if (response.track.album.title) {
            const albumName = response.track.album.title;
            const albumImage =
              response.track.album.image[2]['#text'] || 'default-image-url';

            const existingAlbum = this.trackToAlbum.find(
              (album) => album.albumName === albumName
            );

            if (existingAlbum) {
              existingAlbum.songs.push(song);
            } else {
              this.trackToAlbum.push({
                albumName,
                albumImage,
                songs: [song],
              });
            }
          }
        }
      } catch (error) {
        console.error('Error retrieving album names:', error);
        this.isLoading = false;
      }
    }
  }

  addToListenedSongs(song: string) {
    this.listenedSongsVal = this.listenedSongsVal + 1;
    this.unlistenedSongs = this.unlistenedSongs.filter((s) => s !== song);
  }

  removeFromListenedSongs(song: string) {
    this.listenedSongsVal = this.listenedSongsVal - 1;
    this.unlistenedSongs.push(song);
    this.unlistenedSongsVal = this.unlistenedSongs.length;
  }

  updateStatistics() {
    this.displayStats(); // Call the existing displayStats function
  }
}
