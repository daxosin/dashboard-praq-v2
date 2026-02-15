/**
 * Script pour générer un hash bcrypt à partir d'un PIN 4 chiffres
 * Usage: node scripts/generate-pin.js 1234
 */

const bcrypt = require('bcryptjs');

const pin = process.argv[2];

if (!pin) {
  console.error('Usage: node scripts/generate-pin.js <PIN>');
  console.error('Exemple: node scripts/generate-pin.js 1234');
  process.exit(1);
}

if (!/^\d{4}$/.test(pin)) {
  console.error('Erreur: Le PIN doit être composé de 4 chiffres exactement');
  process.exit(1);
}

const saltRounds = 10;
const hash = bcrypt.hashSync(pin, saltRounds);

console.log('PIN:', pin);
console.log('Hash bcrypt:', hash);
console.log('');
console.log('SQL pour insérer dans staff_pins:');
console.log('');
console.log(`INSERT INTO staff_pins (staff_id, pin_hash, locked, failed_attempts)`);
console.log(`VALUES (`);
console.log(`  '<staff_id_uuid>',`);
console.log(`  '${hash}',`);
console.log(`  false,`);
console.log(`  0`);
console.log(`);`);
console.log('');
console.log('Vérification:');
const isValid = bcrypt.compareSync(pin, hash);
console.log('Le hash est valide:', isValid ? 'OUI' : 'NON');
