import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  constructor() { }

  private loading = false;

  // Define a property to track the loading state
  get isLoading(): boolean {
    return this.loading;
  }

  // Method to start loading
  startLoading(): void {
    this.loading = true;
  }

  // Method to stop loading
  stopLoading(): void {
    this.loading = false;
  }
}
