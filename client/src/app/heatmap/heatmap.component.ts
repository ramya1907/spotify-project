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

  calculateStartOfWeek(date: Date): Date {
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay();
    const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday

    return new Date(currentDate.setDate(diff));
  }
  // Function to calculate the day name for a given date
  calculateDayName(date: Date): string {
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return dayNames[date.getDay()];
  }

  ngOnInit(): void {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    }

    this.getYearlyListeningHistory();
  }

  async getYearlyListeningHistory() {
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
      // const formattedData: any[] = [];
      // for (const [dateStr, count] of Object.entries(playCountsPerDay)) {
      //   const date = new Date(dateStr);
      //   const startOfWeekDate = this.calculateStartOfWeek(date);
      //   const dayName = this.calculateDayName(date);

      //   // Create the formatted object and push it to the array
      //   const formattedObject = {
      //     name: startOfWeekDate,
      //     series: {
      //       date: date,
      //       name: dayName,
      //       value: count,
      //     },
      //   };
      //   formattedData.push(formattedObject);
      // }

      // // Assign the formatted data array to heatmapData property
      // this.heatmapData = formattedData;

      console.log('Play counts per day:', playCountsPerDay);
    } catch (error) {
      console.error('Error retrieving recent tracks:', error);
    }
  }

  generateHeatMap() {}
}
