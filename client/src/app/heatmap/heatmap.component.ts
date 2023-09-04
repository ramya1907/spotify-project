import { Component, OnInit} from '@angular/core';
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

  selectedYear: number = 0;
  availableYears: number[] = [];

  firstDayOfYear = new Date('2023-01-01');
  yearStartDayOfWeek = this.firstDayOfYear.getDay();

  heatmapData: any[] = [];
  isLoading: boolean = false;

  alertUser: boolean = false;
  displayReady: boolean = false;

  playCountsPerDay: { [date: string]: number } = {};
  fromDate = Math.floor(new Date('2022-01-01').getTime() / 1000);
  toDate = Math.floor(new Date(`2023-01-01`).getTime() / 1000)

  legendPosition = 'right';
  roundEdges: boolean = true;
  animations: boolean = true;
  previousMonth: string = 'Dec';

  highestScrobbleDay: string = '';
  highestScrobbleCount: number = 0;
  averageScrobbles: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.username = storedUsername;
    }

    for (let year = 2023; year >= 2002; year--) {
      this.availableYears.push(year);
    }
  }

  onYearChange(): void {
    this.selectYear(this.selectedYear);
  }

  async selectYear(year: number) {
    year = Number (year);
    this.isLoading = true;
    this.firstDayOfYear = new Date(`${year}-01-01`);
    this.yearStartDayOfWeek = this.firstDayOfYear.getDay();
    this.heatmapData = [];
    this.previousMonth = 'Dec';
    this.alertUser = false;
    this.playCountsPerDay = {};
    this.fromDate = Math.floor(new Date(`${year}-01-01`).getTime() / 1000);
    this.toDate = Math.floor(new Date(`${year + 1}-01-01`).getTime() / 1000);

    await this.getRecentTracks(this.selectedYear);
    this.playCountsPerDay = this.populateMissingDays(this.playCountsPerDay, this.firstDayOfYear);
    this.reformatData(this.playCountsPerDay);
    if(this.averageScrobbles === 0){
      this.isLoading = false;
      this.alertUser = true;
      return;
    }
    this.displayReady = true;
  }

  calculateStartOfWeek(date: Date, yearStartDayOfWeek: number): Date {
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay();

    const daysToAdd =
      dayOfWeek === yearStartDayOfWeek ? 0 : yearStartDayOfWeek - dayOfWeek;

    currentDate.setDate(currentDate.getDate() + daysToAdd);

    return currentDate;
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

  generateWeekDayNames(firstDayOfWeek: string): string[] {
    const weekDayNames = [
      'Saturday',
      'Friday',
      'Thursday',
      'Wednesday',
      'Tuesday',
      'Monday',
      'Sunday',
    ];

    const firstDayIndex = weekDayNames.indexOf(firstDayOfWeek);
    const rearrangedNames = weekDayNames
      .slice(firstDayIndex)
      .concat(weekDayNames.slice(0, firstDayIndex));

    return rearrangedNames;
  }

  reformatData(playCountsPerDay: { [date: string]: number }) {
    const groupedDataMap: Map<
      string,
      { date: Date; name: string; value: number }[]
    > = new Map();

    let maxScrobbles = 0;
    let maxScrobblesDay = '';
    let totalScrobbles = 0;

    for (const [dateStr, count] of Object.entries(playCountsPerDay)) {

      if (count > maxScrobbles) {
        maxScrobbles = count;
        maxScrobblesDay = dateStr;
        this.highestScrobbleCount = count; 
      }

      totalScrobbles += count;

      const date = new Date(dateStr);
      const startOfWeekDate = this.calculateStartOfWeek(
        date,
        this.yearStartDayOfWeek
      );

      const dayName = this.calculateDayName(date);

      if (!groupedDataMap.has(startOfWeekDate.toISOString())) {
        groupedDataMap.set(startOfWeekDate.toISOString(), []);
      }

      const seriesData = {
        date: date,
        name: dayName,
        value: count,
      };

      groupedDataMap.get(startOfWeekDate.toISOString())?.push(seriesData);
    }

    this.averageScrobbles = Math.round(totalScrobbles / Object.keys(playCountsPerDay).length);
    if(this.averageScrobbles === 0)
    {
      return;
    }
    this.highestScrobbleDay = maxScrobblesDay;
    this.highestScrobbleDay = new Date(this.highestScrobbleDay).toLocaleDateString('en-GB');

    const formattedData: {
      name: string;
      series: { date: Date; name: string; value: number }[];
    }[] = [];

    for (const [formattedDateStr, seriesArray] of groupedDataMap.entries()) {
      const weekDayNames = this.generateWeekDayNames(
        this.calculateDayName(this.firstDayOfYear)
      );
      const reorderedSeriesArray: {
        date: Date;
        name: string;
        value: number;
      }[] = [];

      // Iterate through weekDayNames to reorder the seriesArray
      for (const dayName of weekDayNames) {
        const dataForDay = seriesArray.find((data) => data.name === dayName);

        if (dataForDay) {
          reorderedSeriesArray.push(dataForDay);
        } else {
          // If data for the day is missing, add an entry with value 0
          reorderedSeriesArray.push({
            date: new Date(formattedDateStr),
            name: dayName,
            value: 0,
          });
        }
      }

      const formattedObject = {
        name: formattedDateStr,
        series: reorderedSeriesArray,
      };

      formattedData.push(formattedObject);
    }

    this.heatmapData = formattedData;

    console.log('heatmap display:', this.heatmapData);
    this.isLoading = false;
  }

  async getRecentTracks(year: number) {

    try {
      let page = 1;
      const limit = 1000;

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

              if (!this.playCountsPerDay[date]) {
                this.playCountsPerDay[date] = 0;
              }

              this.playCountsPerDay[date]++;
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
      this.alertUser = true;
      this.isLoading = false;
    }
  }

  populateMissingDays( playCountsPerDay: { [date: string]: number },
    firstDayofYear: Date
  ) {
    const year = firstDayofYear.getFullYear();

    // Loop through all days of the year
    for (let month = 0; month < 12; month++) {
      for (let day = 1; day <= 31; day++) {
        const currentDate = new Date(year, month, day);
        const currentDateStr = currentDate.toISOString().split('T')[0];

        // If the date is not present in playCountsPerDay, set play count to 0
        if (!playCountsPerDay[currentDateStr]) {
          playCountsPerDay[currentDateStr] = 0;
        }
      }
    }

    let playCountsArray = [];
    playCountsArray = Object.entries(playCountsPerDay);

    // Sort the array based on the dates (keys)
    playCountsArray.sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateA.getTime() - dateB.getTime();
    });

    // Convert the sorted array back to an object
    const sortedPlayCountsPerDay: { [date: string]: number } = {};
    playCountsArray.forEach(([date, count]) => {
      sortedPlayCountsPerDay[date] = count;
    });

    return sortedPlayCountsPerDay;

    
  }

  calendarAxisTickFormatting(value: any) {
    const date = new Date(value);
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[date.getMonth()];

    if (month !== this.previousMonth) {
      this.previousMonth = month;
      return month.toString();
    }

    return '';
  }

  calendarTooltipText(c: any): string {
    const seriesData = c.series[c.index];

    if (c && c.label && c.cell && c.data) {
      return `
      <span class="tooltip-label">${
        c.label
      } • ${c.cell.date.toLocaleDateString()}</span>
      <span class="tooltip-val">${c.data.toLocaleString()}</span>
    `;
    }
    return '';
  }
}
