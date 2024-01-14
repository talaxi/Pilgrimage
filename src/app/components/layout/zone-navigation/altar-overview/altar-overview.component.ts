import { Component, HostListener, OnInit } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AltarEffect } from 'src/app/models/altar/altar-effect.model';
import { AltarInfo } from 'src/app/models/altar/altar-info.model';
import { DirectionEnum } from 'src/app/models/enums/direction-enum.model';
import { GodEnum } from 'src/app/models/enums/god-enum.model';
import { AltarService } from 'src/app/services/altar/altar.service';
import { GameLoopService } from 'src/app/services/game-loop/game-loop.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { LookupService } from 'src/app/services/lookup.service';
import { KeybindService } from 'src/app/services/utility/keybind.service';
import { UtilityService } from 'src/app/services/utility/utility.service';

@Component({
  selector: 'app-altar-overview',
  templateUrl: './altar-overview.component.html',
  styleUrls: ['./altar-overview.component.css']
})
export class AltarOverviewComponent implements OnInit {
  altar1: AltarInfo | undefined;
  altar2: AltarInfo | undefined;
  altar3: AltarInfo | undefined;
  altarEffect1: AltarEffect | undefined;
  altarEffect2: AltarEffect | undefined;
  altarEffect3: AltarEffect | undefined;
  buffTooltipDirection = DirectionEnum.Left;
  subscription: any;
  isMobile: boolean = false;
  altarEffectsActive: boolean = false;
  
  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {    
    this.setupKeybinds(event);    
  }

  constructor(public globalService: GlobalService, private gameLoopService: GameLoopService, private lookupService: LookupService,
    private keybindService: KeybindService, private altarService: AltarService, private deviceDetectorService: DeviceDetectorService,
    private utilityService: UtilityService) { }

  ngOnInit(): void {
    this.isMobile = this.deviceDetectorService.isMobile();
    if (this.isMobile)
      this.buffTooltipDirection = DirectionEnum.Up;

    this.updateAltars();

    this.subscription = this.gameLoopService.gameUpdateEvent.subscribe(async () => {
      this.updateAltars();

      this.altarEffectsActive = this.getAllAltarEffects() !== "";      
    });
  }
  
  notLowPerformanceMode() {
    return this.globalService.globalVar.settings.get("fps") === undefined || this.globalService.globalVar.settings.get("fps") !== this.utilityService.lowFps;
  }

  updateAltars() {
    this.altar1 = this.globalService.globalVar.altars.altar1;
    this.altar2 = this.globalService.globalVar.altars.altar2;
    this.altar3 = this.globalService.globalVar.altars.altar3;

    this.altarEffect1 = this.globalService.globalVar.altars.activeAltarEffect1;
    this.altarEffect2 = this.globalService.globalVar.altars.activeAltarEffect2;
    this.altarEffect3 = this.globalService.globalVar.altars.activeAltarEffect3;
  }

  getRemainingPrayerDuration(altarEffect: AltarEffect) {
    if (altarEffect === undefined)
      return 0;
    else {
      return (altarEffect.duration / altarEffect.totalDuration) * 100;
    }
  }

  getAltarBoon(slotNumber: number) {
    if (slotNumber === 1)
      return this.altarEffect1;
    else if (slotNumber === 2)
      return this.altarEffect2;
    else
      return this.altarEffect3;
  }

  getAltarSpinnerClass(i: number) {
    return 'altarSpinner' + (i + 1);
  }

  getAltarBarClass(i: number) {
    return 'altarBar' + (i + 1);
  }
  
  getProgressTextColor(altarEffect: AltarEffect) {
    if (altarEffect === undefined)
      return {};

    return {
      'athenaColor': altarEffect.associatedGod === GodEnum.Athena,
      'artemisColor': altarEffect.associatedGod === GodEnum.Artemis,
      'hermesColor': altarEffect.associatedGod === GodEnum.Hermes,
      'apolloColor': altarEffect.associatedGod === GodEnum.Apollo,
      'zeusColor': altarEffect.associatedGod === GodEnum.Zeus,
      'aresColor': altarEffect.associatedGod === GodEnum.Ares,
      'hadesColor': altarEffect.associatedGod === GodEnum.Hades,
      'poseidonColor': altarEffect.associatedGod === GodEnum.Poseidon,
      'dionysusColor': altarEffect.associatedGod === GodEnum.Dionysus,
      'nemesisColor': altarEffect.associatedGod === GodEnum.Nemesis,
      'heraColor': altarEffect.associatedGod === GodEnum.Hera,
      'aphroditeColor': altarEffect.associatedGod === GodEnum.Aphrodite
    };
  }

  getProgressColor(altarEffect: AltarEffect) {
    if (altarEffect === undefined)
      return {};

    return {
      'athena-progress': altarEffect.associatedGod === GodEnum.Athena,
      'artemis-progress': altarEffect.associatedGod === GodEnum.Artemis,
      'hermes-progress': altarEffect.associatedGod === GodEnum.Hermes,
      'apollo-progress': altarEffect.associatedGod === GodEnum.Apollo,
      'zeus-progress': altarEffect.associatedGod === GodEnum.Zeus,
      'ares-progress': altarEffect.associatedGod === GodEnum.Ares,
      'hades-progress': altarEffect.associatedGod === GodEnum.Hades,
      'poseidon-progress': altarEffect.associatedGod === GodEnum.Poseidon,
      'dionysus-progress': altarEffect.associatedGod === GodEnum.Dionysus,
      'nemesis-progress': altarEffect.associatedGod === GodEnum.Nemesis,
      'hera-progress': altarEffect.associatedGod === GodEnum.Hera,
      'aphrodite-progress': altarEffect.associatedGod === GodEnum.Aphrodite
    };
  }

  getAltarEffect(slotNumber: number) {
    var description = "";

    if (slotNumber === 1 && this.altarEffect1 !== undefined)
      description = this.lookupService.getAltarEffectDescription(this.altarEffect1);
    if (slotNumber === 2 && this.altarEffect2 !== undefined)
      description = this.lookupService.getAltarEffectDescription(this.altarEffect2);
    if (slotNumber === 3 && this.altarEffect3 !== undefined)
      description = this.lookupService.getAltarEffectDescription(this.altarEffect3);

    return description;
  }

  getAllAltarEffects() {
    var description = "";

    if (this.altarEffect1 !== undefined)
      description += this.lookupService.getAltarEffectDescription(this.altarEffect1);
    if (this.altarEffect2 !== undefined)
      description += this.lookupService.getAltarEffectDescription(this.altarEffect2);
    if (this.altarEffect3 !== undefined)
      description += this.lookupService.getAltarEffectDescription(this.altarEffect3);

    if (this.globalService.globalVar.altars.additionalAltarEffects.length > 0) {
      this.globalService.globalVar.altars.additionalAltarEffects.forEach(effect => {
        description += this.lookupService.getAltarEffectDescription(effect);
      });
    }

    return description;
  }

  setupKeybinds(event: KeyboardEvent) {
    var keybinds = this.globalService.globalVar.keybinds;

    if (this.keybindService.doesKeyMatchKeybind(event, keybinds.get("openFirstAvailableAltar"))) {
      if (this.altar1 !== undefined && this.altar1.conditionCount >= this.altar1.conditionMax)
        this.altarService.pray(this.altar1);
    }

    if (this.keybindService.doesKeyMatchKeybind(event, keybinds.get("openSecondAvailableAltar"))) {
      if (this.altar2 !== undefined && this.altar2.conditionCount >= this.altar2.conditionMax)
        this.altarService.pray(this.altar2);
    }

    if (this.keybindService.doesKeyMatchKeybind(event, keybinds.get("openThirdAvailableAltar"))) {
      if (this.altar3 !== undefined && this.altar3.conditionCount >= this.altar3.conditionMax)
        this.altarService.pray(this.altar3);
    }
  }

  getAltarName(altarEffect: AltarEffect) {
    return this.lookupService.getBoonName(altarEffect.type);
  }

  preventRightClick() {
    return false;
  }

  ngOnDestroy() {
    if (this.subscription !== undefined)
      this.subscription.unsubscribe();
  }
}
