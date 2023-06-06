import { Type } from "class-transformer";
import { CharacterStats } from "../character/character-stats.model";
import { EquipmentQualityEnum } from "../enums/equipment-quality-enum.model";
import { EquipmentTypeEnum } from "../enums/equipment-type-enum.model";
import { ItemsEnum } from "../enums/items-enum.model";
import { WeaponTypeEnum } from "../enums/weapon-type-enum.model";
import { ResourceValue } from "./resource-value.model";
import { UsableItemEffect } from "./usable-item-effect.model";
import { EquipmentSetEnum } from "../enums/equipment-set-enum.model";

export class Equipment {
    itemType: ItemsEnum;
    equipmentType: EquipmentTypeEnum;
    weaponType: WeaponTypeEnum;
    @Type(() => CharacterStats)
    stats: CharacterStats;
    @Type(() => UsableItemEffect)
    equipmentEffects: UsableItemEffect[];
    quality: EquipmentQualityEnum;
    slotCount: number;
    associatedResource: ResourceValue | undefined;
    set: EquipmentSetEnum;

    constructor(itemType: ItemsEnum, equipmentType: EquipmentTypeEnum, quality: EquipmentQualityEnum, weaponType?: WeaponTypeEnum) {
        this.itemType = itemType;
        this.equipmentType = equipmentType;
        this.quality = quality;
        if (weaponType !== undefined)
            this.weaponType = weaponType;
        else
            this.weaponType = WeaponTypeEnum.None;
        
        this.equipmentEffects = [];
        this.slotCount = 0;
        this.set = EquipmentSetEnum.None;
    }
}
