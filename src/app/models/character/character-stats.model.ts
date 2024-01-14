import { Type } from "class-transformer";
import { ElementalStats } from "./elemental-stats.model";

export class CharacterStats {
    maxHp: number;
    currentHp: number;
    attack: number;
    defense: number;
    agility: number;
    luck: number; 
    resistance: number;

    //regen is every 5 seconds
    hpRegen: number;
    criticalMultiplier: number;
    @Type(() => ElementalStats)
    elementIncrease: ElementalStats;
    @Type(() => ElementalStats)
    elementResistance: ElementalStats;
    abilityCooldownReduction: number;
    autoAttackCooldownReduction: number;
    armorPenetration: number;
    overdriveGain: number;
    healingReceived: number;
    debuffDuration: number;
    buffDuration: number;
    linkEffectiveness: number;
    overdriveGainFromAutoAttacks: number;
    healingDone: number;
    aoeDamage: number;
    tickFrequency: number;
    abilityCooldownReductionWithBuffs: number;
    thorns: number;
    abilityCooldownReductionStart: number;   
    xpGain: number; 
    elementResistanceReduction: number;
    allyDamageBonus: number;
    duoPermanentEffectiveness: number;

    constructor(hp: number,strength: number, defense: number, agility: number, luck: number, resistance: number) {
        this.maxHp = hp;
        this.currentHp = hp;        
        this.attack = strength;
        this.defense = defense;
        this.agility = agility;
        this.luck = luck;
        this.resistance = resistance;

        this.hpRegen = 0;
        this.criticalMultiplier = 0;
        this.elementIncrease = new ElementalStats();
        this.elementResistance = new ElementalStats();
        this.abilityCooldownReduction = 0; 
        this.autoAttackCooldownReduction = 0; 
        this.armorPenetration = 0;
        this.overdriveGain = 0;
        this.healingReceived = 0;
        this.debuffDuration = 0;
        this.buffDuration = 0;
        this.linkEffectiveness = 0;
        this.overdriveGainFromAutoAttacks = 0;
        this.healingDone = 0;
        this.aoeDamage = 0;
        this.tickFrequency = 0;
        this.abilityCooldownReductionWithBuffs = 0;
        this.abilityCooldownReductionStart = 0;
        this.thorns = 0;
        this.xpGain = 0;
        this.elementResistanceReduction = 0;
        this.allyDamageBonus = 0;
        this.duoPermanentEffectiveness = 0;
    }

    makeCopy(excludeCurrentHp: boolean = true) {
        var currentHp = this.currentHp;
        var copy = new CharacterStats(this.maxHp,this.attack, this.defense, this.agility, this.luck, this.resistance);

        if (excludeCurrentHp)
            copy.currentHp = currentHp;

        return copy;
    }
}
