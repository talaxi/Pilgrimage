import { Component, Input, OnInit } from '@angular/core';
import { Character } from 'src/app/models/character/character.model';
import { CharacterEnum } from 'src/app/models/enums/character-enum.model';
import { GodEnum } from 'src/app/models/enums/god-enum.model';
import { GlobalService } from 'src/app/services/global/global.service';
import { LookupService } from 'src/app/services/lookup.service';

@Component({
  selector: 'app-character-name-view',
  templateUrl: './character-name-view.component.html',
  styleUrls: ['./character-name-view.component.css']
})
export class CharacterNameViewComponent implements OnInit {
  @Input() character: Character;
  public noCharacter = CharacterEnum.none;
  public noGod = GodEnum.None;

  constructor(public lookupService: LookupService, private globalService: GlobalService) { }

  ngOnInit(): void {
        
  }

  getCharacterGodName(character: Character, whichGod: number) {
    var matchTo = character.assignedGod1;
    if (whichGod === 2)
      matchTo = character.assignedGod2;

    var god = this.globalService.globalVar.gods.find(item => item.type === matchTo);
    
    if (god !== undefined) {
      return god.name;
    }

    return "";
  }

  getCharacterGodLevel(character: Character, whichGod: number) {
    var matchTo = character.assignedGod1;
    if (whichGod === 2)
      matchTo = character.assignedGod2;

    var god = this.globalService.globalVar.gods.find(item => item.type === matchTo);
    if (god !== undefined) {
      return god.level;
    }

    return "";
  }

  
  getGodPassiveDescription(whichGod: number) {
    var passiveDescription = "";

    var matchTo = this.character.assignedGod1;
    if (whichGod === 2)
      matchTo = this.character.assignedGod2;

    var god = this.globalService.globalVar.gods.find(item => item.type === matchTo);
    if (god === undefined || !god.abilityList.some(ability => ability.isPassive && ability.isAvailable)) {
      return passiveDescription;      
    }

    var passiveAbility = god.abilityList.find(item => item.isPassive && item.isAvailable);
    if (passiveAbility === undefined)
      return passiveDescription;

    passiveDescription = this.lookupService.getGodAbilityDescription(passiveAbility.name);

    return passiveDescription;
  }

  getCharacterPassiveDescription() {    
    var passiveDescription = "";

    var passiveAbility = this.character.abilityList.find(item => item.isPassive && item.isAvailable);
    if (passiveAbility === undefined)
      return passiveDescription;

    passiveDescription = this.lookupService.getCharacterAbilityDescription(passiveAbility.name);

    return passiveDescription;
  }

  getCharacterXpPercent() {
    return (this.character.exp / this.character.expToNextLevel) * 100;
  }

  getGodXpPercent(whichGod: number) {
    var matchTo = this.character.assignedGod1;
    if (whichGod === 2)
      matchTo = this.character.assignedGod2;

    var god = this.globalService.globalVar.gods.find(item => item.type === matchTo);
    
    if (god !== undefined) {
      return (god.exp / god.expToNextLevel) * 100;
    }

    return 0;
  }

  isCharacterPassiveUnlocked() {
    return this.character.abilityList.some(item => item.isPassive && item.isAvailable);
  }

  isGodPassiveUnlocked(whichGod: number) {
    var matchTo = this.character.assignedGod1;
    if (whichGod === 2)
      matchTo = this.character.assignedGod2;

    var god = this.globalService.globalVar.gods.find(item => item.type === matchTo);
    if (god === undefined)
      return false;

    return god.abilityList.some(item => item.isPassive && item.isAvailable);
  }
}