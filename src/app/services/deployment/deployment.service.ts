import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DeploymentService {
  devModeActive = false;
  forceStartNewGame = false;
  codeCreationMode = false;
  showStats = false;
  performanceModeAvailable = false;

  constructor() { }

  setProductionMode()
  {
    this.devModeActive = false;
    this.forceStartNewGame = false;
    this.codeCreationMode = false;
    this.showStats = false;
    this.performanceModeAvailable = false;
  }

  setStagingMode() {
    this.devModeActive = false;
    this.forceStartNewGame = false;
    this.codeCreationMode = true;
    this.showStats = false;
    this.performanceModeAvailable = true;
  }
}
