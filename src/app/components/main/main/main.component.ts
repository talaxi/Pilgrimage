import { Component, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NavigationEnum } from 'src/app/models/enums/navigation-enum.model';
import { LayoutService } from 'src/app/models/global/layout.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { LookupService } from 'src/app/services/lookup.service';
import { StoryService } from 'src/app/services/story/story.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  navigation: NavigationEnum;  
  subscription: any;
  public navigationEnum = NavigationEnum;
  underworldAnimation = false;
  maxBankedTime = 0;
  displayFunFacts = false;
  isMobile = false;

  constructor(private layoutService: LayoutService, private gameLoopService: GameLoopService, public lookupService: LookupService,
    public storyService: StoryService, private deviceDetectorService: DeviceDetectorService, private globalService: GlobalService,
    private utilityService: UtilityService) { }

  ngOnInit(): void {
    this.isMobile = this.deviceDetectorService.isMobile();
    
    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe(async () => {
      this.navigation = this.layoutService.navigation;
    });
  }

  closeMobileMenu() {
    this.layoutService.mobileMenuOpen = false;
  }

  getLoadingPercent() {
    var remainingLoad = 0;

    remainingLoad = (1 - (this.globalService.bankedTime / this.globalService.maxBankedTime)) * 100;

    return remainingLoad;
  }

  getActiveTimeAmount() {
    return (this.globalService.globalVar.settings.get("loadingTime") ?? this.utilityService.averageActiveTimeLimit) / 60;
  }

  ngOnDestroy() {    
  }
}
