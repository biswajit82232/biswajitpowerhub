import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getChargingHabit, simulate } from '../src/lib/simulator.js';
import { parseBatteryKwhOrNull } from '../src/lib/battery.js';

test('daily km above range asks for more than one charge', () => {
  const habit = getChargingHabit(0.4);
  assert.match(habit.label, /more than once/i);
});

test('unknown battery capacity does not invent 1.5 kWh', () => {
  assert.equal(parseBatteryKwhOrNull(''), null);
  assert.equal(parseBatteryKwhOrNull('n/a'), null);
  const r = simulate({
    scooter: { batteryCapacity: '', range: 80 },
    dailyDistance: 20,
    electricityRate: 7,
  });
  assert.equal(r.capacityUnknown, true);
  assert.equal(r.monthlyCost, 0);
});

test('48V / 24Ah parses to kWh', () => {
  assert.equal(parseBatteryKwhOrNull('48V / 24Ah'), (48 * 24) / 1000);
});
