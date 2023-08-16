import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css'],
})
export class HeatmapComponent implements OnInit {
  username = '';
  apiKey: string = '846e19279fa31e6d74cad5d88e4a1a1f';
  lastFmApiUrl = 'https://ws.audioscrobbler.com/2.0/';

  fromDate = Math.floor(new Date('2023-01-01').getTime() / 1000);
  toDate = Math.floor(new Date('2023-12-31').getTime() / 1000);

  heatmapData: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    }
  }

  async getYearlyListeningHistory(artistName: string) {
    let page = 1;
    const limit = 1000;
    const playCountsPerDay: { [date: string]: number } = {};

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
              from: this.fromDate,
              to: this.toDate,
              format: 'json',
            },
          })
        );

        if (response.recenttracks && response.recenttracks.track) {
          for (const track of response.recenttracks.track) {
            const timestamp = parseInt(track.date.uts);
            const date = new Date(timestamp * 1000).toISOString().split('T')[0];

            if (!playCountsPerDay[date]) {
              playCountsPerDay[date] = 0;
            }

            playCountsPerDay[date]++;
          }
        }

        if (response.recenttracks.track.length < limit) {
          break;
        }

        page++;
      }
      console.log('Play counts per day:', playCountsPerDay);
      const playCountsArray = Object.entries(playCountsPerDay).map(([date, count]) => ({
        date: new Date(date),
        value: count,
      }));
      this.heatmapData = playCountsArray; 

    } catch (error) {
      console.error('Error retrieving recent tracks:', error);
    }
  }

  generateHeatMap(){
    
  }
}
