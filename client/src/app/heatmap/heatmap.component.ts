import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { formatDate } from '@angular/common';
import { DatePipe } from '@angular/common';

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

  selectedYear: number = 2023;
  availableYears: number[] = [2020, 2021, 2022, 2023];

  heatmapData: any[] = [];

  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  onYearChange(): void {
    this.selectYear(this.selectedYear);
  }

  selectYear(year: number) {
    this.fromDate = Math.floor(new Date(`${year}-01-01`).getTime() / 1000);
    this.toDate = Math.floor(new Date(`${year}-12-31`).getTime() / 1000);
  }

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
            if (track.date && track.date.uts) {
              const timestamp = parseInt(track.date.uts);
              const date = new Date(timestamp * 1000)
                .toISOString()
                .split('T')[0];

              if (!playCountsPerDay[date]) {
                playCountsPerDay[date] = 0;
              }

              playCountsPerDay[date]++;
            }
          }
        }

        if (response.recenttracks.track.length < limit) {
          break;
        }

        page++;
      }
      let formattedDateStr = null;
      const groupedDataMap: Map<string, { name: string; value: number }[]> =
        new Map();

      for (const [dateStr, count] of Object.entries(playCountsPerDay)) {
        const date = new Date(dateStr);
        const startOfWeekDate = this.calculateStartOfWeek(date);

        const dayName = this.calculateDayName(date);

        formattedDateStr = this.datePipe.transform(
          startOfWeekDate,
          'yyyy-MM-dd'
        );

        if (!groupedDataMap.has(startOfWeekDate.toISOString())) {
          groupedDataMap.set(startOfWeekDate.toISOString(), []);
        }

        const seriesData = {
          name: dayName,
          value: count,
        };

        groupedDataMap.get(startOfWeekDate.toISOString())?.push(seriesData);
      }

      const formattedData: {
        name: string;
        series: { name: string; value: number }[];
      }[] = [];

      for (const [formattedDateStr, seriesArray] of groupedDataMap.entries()) {
        const weekDayNames = [
          'Saturday',
          'Friday',
          'Thursday',
          'Wednesday',
          'Tuesday',
          'Monday',
          'Sunday'
        ];
        
        // Sort the days of the week in order (Sunday to Saturday)
        const sortedSeries = weekDayNames.map(
          (dayName) =>
            seriesArray.find((data) => data.name === dayName) || {
              name: dayName,
              value: 0,
            }
        );
        const formattedObject = {
          // name: startOfWeekDate,
          name: formattedDateStr,
          // series: seriesArray,
          series: sortedSeries
        };

        formattedData.push(formattedObject);
      }

      // Sort the formatted data in ascending order based on the start of the week date
      formattedData.sort(
        (a, b) => new Date(a.name).getTime() - new Date(b.name).getTime()
      );

      // Assign the formatted data array to heatmapData property
      this.heatmapData = formattedData;

      console.log('Play counts per day:', this.heatmapData);
    } catch (error) {
      console.error('Error retrieving recent tracks:', error);
    }
  }

  xAxisTickFormatting(value: any): string {
    const date = new Date(value);
    return formatDate(date, 'MMM', 'en-US');
  }
}
