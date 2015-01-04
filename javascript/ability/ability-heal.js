// the heal ability
// @param object game The game currently being played
// @param Object classType The class type that has this ability
function AbilityHeal (game, classType) {
  
  // call the parent ability with this as reference
  BaseAbility.call(this, game, classType);
  // the ability type
  this.type = 'mana';
  // this ability health cost
  this.healthCostBase = 0;
  // this ability mana cost
  this.manaCostBase = 70;
  // this ability stamina cost
  this.staminaCostBase = 0;
  // the health damage this ability does
  this.healthDamageBase = (function () {
    // current base damage
    return classType.damageTotal;
  })();
  // the mana damage that this ability does
  this.manaDamageBase = 0;
  // the stamina damage that this ability does
  this.staminaDamageBase = 0;
  // the amount of health gained from this ability
  this.healthGainBase = (function () {
    // 20% of max health
    return classType.damageTotal * 2;
  })();
  // the amount of mana gained from this ability
  this.manaGainBase = 0;
  // the amount of stamina gained from this ability
  this.staminaGainBase = 0;
  // the name of the ability
  this.name = 'Heal';
  // the description of this ability
  this.description = 'Heal for 200% base damage. Deal base damage.';
  // the key assigned to this ability
  this.key = 87;
  
};

// this class extends the base ability class
AbilityHeal.inheritsFrom(BaseAbility);