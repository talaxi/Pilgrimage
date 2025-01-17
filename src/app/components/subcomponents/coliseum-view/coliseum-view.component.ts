import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatDialog as MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ColiseumTournament } from 'src/app/models/battle/coliseum-tournament.model';
import { ColiseumTournamentEnum } from 'src/app/models/enums/coliseum-tournament-enum.model';
import { ItemTypeEnum } from 'src/app/models/enums/item-type-enum.model';
import { ColiseumService } from 'src/app/services/battle/coliseum.service';
import { DpsCalculatorService } from 'src/app/services/battle/dps-calculator.service';
import { GameLogService } from 'src/app/services/battle/game-log.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { LookupService } from 'src/app/services/lookup.service';
import { DictionaryService } from 'src/app/services/utility/dictionary.service';
import { KeybindService } from 'src/app/services/utility/keybind.service';
import { UtilityService } from 'src/app/services/utility/utility.service';
import { ItemsEnum } from 'src/app/models/enums/items-enum.model';
import { MenuService } from 'src/app/services/menu/menu.service';
import { Equipment } from 'src/app/models/resources/equipment.model';
declare var LZString: any;
import { Platform } from '@ionic/angular';
import 'cordova-plugin-purchase';
import { ResourceValue } from 'src/app/models/resources/resource-value.model';

@Component({
  selector: 'app-coliseum-view',
  templateUrl: './coliseum-view.component.html',
  styleUrls: ['./coliseum-view.component.css']
})
export class ColiseumViewComponent implements OnInit {
  selectedTournament: ColiseumTournament;
  repeatColiseumFight: boolean = false;
  automateEternalMelee: boolean = false;
  rewardsText = "";
  standardColiseumTournaments: ColiseumTournamentEnum[] = [];
  specialColiseumTournaments: ColiseumTournamentEnum[] = [];
  @ViewChild('confirmationBox') confirmationBox: any;
  confirmationText = "You are currently set to automate through the Eternal Melee with all of your tickets. You will not be able to stop part way through to adjust your team. Continue?";
  @ViewChild('purchaseBox') transactionBox: any;
  transactionEnabled: boolean = true;
  transactionConfirmationText = "";
  battleData = "";
  dialogRef: MatDialogRef<any, any>;
  file: any;
  hermessStaffDescription: Equipment | undefined;
  shieldOfUnendingFlamesDescription: Equipment | undefined;
  isAndroid = false;  
  store = CdvPurchase.store;
  products: CdvPurchase.Product[];

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    var keybinds = this.globalService.globalVar.keybinds;

    if (this.keybindService.doesKeyMatchKeybind(event, keybinds.get("menuTraverseSubMenuUp"))) {
      this.toggleSubMenuOptions(-1);
    }

    if (this.keybindService.doesKeyMatchKeybind(event, keybinds.get("menuTraverseSubMenuDown"))) {
      this.toggleSubMenuOptions(1);
    }

    if (this.keybindService.doesKeyMatchKeybind(event, keybinds.get("triggerAction"))) {
      this.startTournament();
    }
  }

  constructor(private coliseumService: ColiseumService, private globalService: GlobalService, public dialog: MatDialog,
    private lookupService: LookupService, private utilityService: UtilityService, private dictionaryService: DictionaryService,
    private deviceDetectorService: DeviceDetectorService, private keybindService: KeybindService, private dpsCalculatorService: DpsCalculatorService,
    private gameLogService: GameLogService, private menuService: MenuService, private plt: Platform, private ref: ChangeDetectorRef) { 
      this.plt.ready().then(() => {      
        this.registerProducts();
        this.setupListeners();
        this.store.verbosity = CdvPurchase.LogLevel.DEBUG;
  
        // Get the real product information
        this.store.ready(() => {
          this.ref.detectChanges();
        });
      });
    }

  ngOnInit(): void {
    this.isAndroid = this.deviceDetectorService.isMobile() && !this.utilityService.isMainSite() && !this.utilityService.isKongregate();    
    this.rewardsText = this.setRewardsText();
    this.repeatColiseumFight = this.globalService.globalVar.settings.get("repeatColiseumFight") ?? false;
    this.automateEternalMelee = this.globalService.globalVar.settings.get("automateEternalMelee") ?? false;
    this.standardColiseumTournaments = this.getStandardColiseumTournaments();
    this.specialColiseumTournaments = this.getSpecialColiseumTournaments();
    if (this.standardColiseumTournaments.length > 0)
      this.selectedTournament = this.dictionaryService.getColiseumInfoFromType(this.standardColiseumTournaments[0]);

    this.hermessStaffDescription = this.lookupService.getEquipmentPieceByItemType(ItemsEnum.HermessStaff);
    this.shieldOfUnendingFlamesDescription = this.lookupService.getEquipmentPieceByItemType(ItemsEnum.ShieldOfUnendingFlames);
    
    if (this.utilityService.isKongregate())
      this.transactionEnabled = false;
  }

  isMobile() {
    return this.deviceDetectorService.isMobile();
  }

  openConfirmationDialog() {
    return this.dialog.open(this.confirmationBox, { width: '40%', height: 'auto' });
  }

  openPurchaseDialog() {
    return this.dialog.open(this.transactionBox, { width: '40%', height: 'auto' });
  }

  getStandardColiseumTournaments() {
    var tournaments: ColiseumTournamentEnum[] = [];
    for (const [propertyKey, propertyValue] of Object.entries(ColiseumTournamentEnum)) {
      if (!Number.isNaN(Number(propertyKey))) {
        continue;
      }

      var enumValue = propertyValue as ColiseumTournamentEnum;
      if (enumValue !== ColiseumTournamentEnum.None) {
        if (enumValue === ColiseumTournamentEnum.TournamentOfTheDead)
          tournaments.push(enumValue)
        else {
          var tournamentType = this.globalService.globalVar.coliseumDefeatCount.find(item => item.type === enumValue);
          if (tournamentType !== undefined && tournamentType.isAvailable && !this.coliseumService.isTournamentTypeSpecial(tournamentType.type)) {
            tournaments.push(enumValue);
          }
        }
      }
    }

    tournaments.sort((a, b) => this.sortColiseumList(a, b));

    return tournaments;
  }

  sortColiseumList(a: ColiseumTournamentEnum, b: ColiseumTournamentEnum) {
    var aLevel = this.getColiseumCompletionLevel(a);
    var bLevel = this.getColiseumCompletionLevel(b);
    return aLevel < bLevel ? -1 : aLevel > bLevel ? 1 : 0;
  }

  getSpecialColiseumTournaments() {
    var tournaments: ColiseumTournamentEnum[] = [];

    var weeklyMelee = this.globalService.globalVar.coliseumDefeatCount.find(item => item.type === ColiseumTournamentEnum.WeeklyMelee);
    if (weeklyMelee !== undefined && weeklyMelee.isAvailable) {
      tournaments.push(weeklyMelee.type);
    }

    tournaments.push(ColiseumTournamentEnum.FriendlyCompetition);

    tournaments.sort((a, b) => this.sortColiseumList(a, b));

    return tournaments;
  }

  chooseColiseumTournament(tournament: ColiseumTournamentEnum) {
    this.selectedTournament = this.dictionaryService.getColiseumInfoFromType(tournament);
  }

  getTournamentName(type?: ColiseumTournamentEnum) {
    if (type === undefined) {
      return this.dictionaryService.getTournamentName(this.selectedTournament.type);
    }
    else
      return this.dictionaryService.getTournamentName(type);
  }

  getTournamentDescription() {
    return this.coliseumService.getTournamentDescription(this.selectedTournament.type);
  }

  getRequiredDpsForSelectedTournament() {
    return this.utilityService.bigNumberReducer(this.globalService.globalVar.settings.get("showBigNumberColors") ?? false, this.coliseumService.getRequiredDps(this.selectedTournament.type));
  }

  getFirstTimeCompletionRewards() {
    var reward = "";

    this.selectedTournament.completionReward.forEach(item => {
      var itemName = (item.amount === 1 ? this.dictionaryService.getItemName(item.item) : this.utilityService.handlePlural(this.dictionaryService.getItemName(item.item)));
      if (this.lookupService.getItemTypeFromItemEnum(item.item) === ItemTypeEnum.Equipment) {
        var qualityClass = this.lookupService.getEquipmentQualityClass(this.lookupService.getEquipmentPieceByItemType(item.item)?.quality);

        itemName = "<span class='" + qualityClass + "'>" + itemName + "</span>";
      }

      reward += item.amount.toLocaleString() + " " + itemName + "<br/>";
    });

    return reward;
  }

  firstTimeRewardAlreadyObtained(type?: ColiseumTournamentEnum) {
    if (type === undefined)
      type = this.selectedTournament.type;

    var tournamentType = this.globalService.globalVar.coliseumDefeatCount.find(item => item.type === type);
    if (tournamentType?.count !== undefined && tournamentType?.count >= 1)
      return true;

    return false;
  }

  getQuickCompletionRewards() {
    var reward = "";

    this.selectedTournament.quickCompletionReward.forEach(item => {
      var itemName = (item.amount === 1 ? this.dictionaryService.getItemName(item.item) : this.utilityService.handlePlural(this.dictionaryService.getItemName(item.item)));
      if (this.lookupService.getItemTypeFromItemEnum(item.item) === ItemTypeEnum.Equipment) {
        var qualityClass = this.lookupService.getEquipmentQualityClass(this.lookupService.getEquipmentPieceByItemType(item.item)?.quality);

        itemName = "<span class='" + qualityClass + "'>" + itemName + "</span>";
      }

      reward += item.amount + " " + itemName + "<br/>";
    });

    return reward;
  }

  quickCompletionRewardAlreadyObtained(type?: ColiseumTournamentEnum) {
    if (type === undefined)
      type = this.selectedTournament.type;

    var tournamentType = this.globalService.globalVar.coliseumDefeatCount.find(item => item.type === type);
    if (tournamentType?.quickVictoryCompleted)
      return true;

    return false;
  }

  //1 is not started, 2 is cleared, 3 is completed
  getColiseumCompletionLevel(type: ColiseumTournamentEnum) {
    var level = 1;

    if (this.firstTimeRewardAlreadyObtained(type))
      level = 2;

    if (this.quickCompletionRewardAlreadyObtained(type))
      level = 3;

    return level;
  }

  getColiseumNameColor(type: ColiseumTournamentEnum) {
    if (this.firstTimeRewardAlreadyObtained(type) && !this.quickCompletionRewardAlreadyObtained(type)) {
      if (this.selectedTournament !== undefined && this.selectedTournament.type === type)
        return { 'activeBackground clearedSubzoneColor': true };
      else
        return { 'clearedSubzoneColor': true };
    }
    else if (this.firstTimeRewardAlreadyObtained(type) && this.quickCompletionRewardAlreadyObtained(type)) {
      if (this.selectedTournament !== undefined && this.selectedTournament.type === type)
        return { 'activeBackground completedSubzoneColor': true };
      else
        return { 'completedSubzoneColor': true };
    }
    else {
      if (this.selectedTournament !== undefined && this.selectedTournament.type === type)
        return { 'active': true };
    }

    return {};
  }

  startTournament() {
    this.dpsCalculatorService.rollingAverageTimer = 0;
    this.dpsCalculatorService.partyDamagingActions = [];
    this.dpsCalculatorService.enemyDamagingActions = [];
    this.dpsCalculatorService.xpGain = [];

    if (this.isSelectedTournamentWeeklyMelee() && this.automateEternalMelee) {
      if (this.repeatColiseumFight) {
        //only show dialog if automating and repeating
        var dialogRef = this.openConfirmationDialog();

        dialogRef.afterClosed().subscribe(dialogResult => {
          if (dialogResult) {
            var tickets = this.globalService.globalVar.resources.find(item => item.item === ItemsEnum.EternalMeleeTicket);
            var ticketCount = 14;
            if (tickets !== undefined)
              ticketCount = tickets.amount;

            this.lookupService.isUIHidden = true;
            this.globalService.globalVar.isCatchingUp = true;
            this.gameLogService.disableOverlayBuffer = true;
            this.globalService.bankedTime += ticketCount * 5 * 60;
            this.globalService.maxBankedTime = this.globalService.bankedTime;
            this.globalService.startColiseumTournament(this.selectedTournament);
            this.dialog.closeAll();
          }
        });
      }
      else {
        this.lookupService.isUIHidden = true;
        this.globalService.globalVar.isCatchingUp = true;
        this.gameLogService.disableOverlayBuffer = true;
        this.globalService.bankedTime += 5 * 60;
        this.globalService.maxBankedTime = this.globalService.bankedTime;
        this.globalService.startColiseumTournament(this.selectedTournament);
        this.dialog.closeAll();
      }
    }
    else {
      this.globalService.startColiseumTournament(this.selectedTournament);
      this.dialog.closeAll();
    }
  }

  canEnterWeeklyMelee() {
    return this.globalService.globalVar.sidequestData.weeklyMeleeEntries > 0;
  }

  isSelectedTournamentWeeklyMelee() {
    return this.selectedTournament.type === ColiseumTournamentEnum.WeeklyMelee;
  }

  isSelectedTournamentFriendlyCompetition() {
    return this.selectedTournament.type === ColiseumTournamentEnum.FriendlyCompetition;
  }

  getWeeklyEntries() {
    return this.globalService.globalVar.sidequestData.weeklyMeleeEntries;
  }

  getWeeklyEntryCap() {
    var ticketMultiplier = 1;
    if (this.globalService.globalVar.isSubscriber)
      ticketMultiplier = 2;

    return this.utilityService.weeklyMeleeEntryCap * ticketMultiplier;
  }

  getHighestWeeklyMeleeRoundCompleted() {
    return this.globalService.globalVar.sidequestData.highestWeeklyMeleeRound;
  }

  repeatColiseumFightToggle() {
    this.globalService.globalVar.settings.set("repeatColiseumFight", this.repeatColiseumFight);
  }

  automateEternalMeleeToggle() {
    this.globalService.globalVar.settings.set("automateEternalMelee", this.automateEternalMelee);
  }

  isRoundComplete(round: number) {
    if (this.getHighestWeeklyMeleeRoundCompleted() >= round) {
      return { 'crossed': true };
    }

    return {};
  }

  setRewardsText() {
    var rewardsText = "";

    rewardsText = "Enemies will not give XP, Coins, or Items like normal. Instead, you will gain XP and Coins based on how many rounds you complete. The further you progress, the more you will gain. In addition, you will gain an item reward after each boss fight. <br/><br/>" +
      "Completing Round 5: +75-150 Basic Crafting Materials<br/>" +
      "Completing Round 10: +150-250 Rough Gem Fragments<br/>" +
      "Completing Round 15: +25-200 Metal Scraps<br/>" +
      "Completing Round 20: +25-150 Chthonic Favor<br/>" +
      "Completing Round 25: +75-150 Uncommon Crafting Materials<br/>" +
      "Completing Round 30: +50-200 Metal Nuggets<br/>" +
      "Completing Round 35: +75-150 Rare Crafting Materials<br/>" +
      "Completing Round 40: +150-250 Rutile Gem Fragments<br/>" +
      "Completing Round 45: +50-200 Metal Cores<br/>" +
      "Completing Round 50: +75-150 Epic Crafting Materials<br/>" +
      "Completing Round 55: +150-250 Perfect Gem Fragments<br/>" +
      "Every successive boss fight: +500 Special Crafting Materials, 100 <span class='uniqueEquipment bold'>Shield of Unending Flames</span> XP<br/><br/>" +
      "<b><i>Rewards will continue to be adjusted as future content is added to the game</i></b>"

    return rewardsText;
  }

  openModal(content: any) {
    this.dialogRef = this.dialog.open(content, { width: '75%', height: 'auto' });
    return this.dialogRef;
  }

  closeDialog() {
    if (this.dialogRef !== undefined)
      this.dialogRef.close(true);
  }

  openTransactionModal() {
    var ticketMultiplier = 1;
    if (this.globalService.globalVar.isSubscriber)
      ticketMultiplier = 2;

    this.transactionConfirmationText = "<span class='s4Heading'>For $1, gain a full set of <b>" + (this.utilityService.weeklyMeleeEntryCap * ticketMultiplier) + " Eternal Melee tickets</b></span>.";

    var supportArea = " on the footer below ";
    if (this.isMobile())
      supportArea = " in the menu ";

    if (ticketMultiplier === 1)
      this.transactionConfirmationText += "<br/><br/><i>Note that Subscribers gain <strong>" + (this.utilityService.weeklyMeleeEntryCap * 2) + "</strong> tickets instead of <strong>" + (this.utilityService.weeklyMeleeEntryCap) + "</strong>, as well as numerous other benefits. Press 'Cancel' and visit the 'Support' area " + supportArea + " to see how to subscribe for a one time payment of $3.</i>";

    var dialogRef = this.openPurchaseDialog();

    dialogRef.afterClosed().subscribe(dialogResult => {
      if (dialogResult) {
        window.location.href = 'https://square.link/u/Cf9TBEF1';
      }
    });
  }

  toggleSubMenuOptions(direction: number) {
    var isStandard = this.standardColiseumTournaments.some(item => item === this.selectedTournament.type);
    if (isStandard) {
      var currentIndex = this.standardColiseumTournaments.findIndex(item => item === this.selectedTournament.type);
      currentIndex += direction;

      if (currentIndex < 0)
        currentIndex = this.standardColiseumTournaments.length - 1;
      if (currentIndex > this.standardColiseumTournaments.length - 1)
        currentIndex = 0;

      this.chooseColiseumTournament(this.standardColiseumTournaments[currentIndex]);
    }
    else {
      var currentIndex = this.specialColiseumTournaments.findIndex(item => item === this.selectedTournament.type);
      currentIndex += direction;

      if (currentIndex < 0)
        currentIndex = this.specialColiseumTournaments.length - 1;
      if (currentIndex > this.specialColiseumTournaments.length - 1)
        currentIndex = 0;

      this.chooseColiseumTournament(this.specialColiseumTournaments[currentIndex]);
    }
  }

  inTextbox() {
    this.menuService.inTextbox = true;
  }

  outOfTextbox() {
    this.menuService.inTextbox = false;
  }

  startFriendlyCompetition() {
    this.selectedTournament.competitionData = this.battleData;
    this.startTournament();
  }

  exportBattleData() {
    var party = this.coliseumService.setupCompetitionParty();

    var battleData = JSON.stringify(party);
    var compressedData = LZString.compressToBase64(battleData);
    this.battleData = compressedData;
  }

  public exportBattleDataToFile() {
    var party = this.coliseumService.setupCompetitionParty();

    var battleData = JSON.stringify(party);
    var compressedData = LZString.compressToBase64(battleData);

    let file = new Blob([compressedData], { type: '.txt' });
    let a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = "BalladOfHeroes-FriendlyCompetitionData-" + new Date().toLocaleDateString();
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  public startFriendlyCompetitionFromFile() {    
    if (this.file === null || this.file === undefined || this.file.length === 0)
      alert("First select a file to import.");

    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      if (fileReader.result !== null) {
        this.selectedTournament.competitionData = fileReader.result.toString();        
        this.startTournament();
      }      
    }
    fileReader.readAsText(this.file);
  }

  fileChanged(e: any) {
    this.file = e.target.files[0];
  }

  
  registerProducts() {
    const { ProductType, Platform, LogLevel, Product, VerifiedReceipt } = CdvPurchase; // shortcuts

    this.store.register({
      id: this.utilityService.ETERNAL_MELEE_KEY,
      type: ProductType.CONSUMABLE,
      platform: Platform.GOOGLE_PLAY,      
    });
    
    this.store.initialize([Platform.GOOGLE_PLAY]);

    this.products = this.store.products;

    this.store.update();
  }

  setupListeners() {
    // General query to all products
    this.store.when()    
    .approved(transaction => {
      var ticketMultiplier = 1;
        if (this.globalService.globalVar.isSubscriber)
          ticketMultiplier = 2;

        var additionalTickets = this.utilityService.weeklyMeleeEntryCap * ticketMultiplier;

        this.lookupService.gainResource(new ResourceValue(ItemsEnum.EternalMeleeTicket, additionalTickets));
      // verify approved transactions
      //this.store.verify(transaction);
    })
    /*.verified(receipt => {
      // finish transactions from verified receipts
      //this.store.finish(receipt);      
    });*/
  }

  androidPurchase() {
    const store = CdvPurchase.store;
    const subscriber = store.products.find(p => p.id === this.utilityService.ETERNAL_MELEE_KEY);

    if (subscriber === undefined)
      return;

    const offer = store.get(subscriber.id, subscriber.platform)?.getOffer();

    if (offer) store.order(offer);
  }   
}
