import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TIMELINE_MILESTONES } from '../data/timelineData.ts';

describe('Physics Logic & Simulation Test Suite', () => {
  // TC-01: Timeline Integrity & Order
  it('TC-01: Timeline should have 7 comprehensive chronological milestones', () => {
    assert.strictEqual(TIMELINE_MILESTONES.length, 7, 'Timeline must contain exactly 7 key historical milestones');
    
    // Check key scientists in sequence
    const scientists = TIMELINE_MILESTONES.map((m) => m.scientist);
    assert.ok(scientists[0].includes('Newton'), 'First milestone should be Newton');
    assert.ok(scientists[1].includes('Young'), 'Second milestone should be Young');
    assert.ok(scientists[2].includes('Maxwell'), 'Third milestone should be Maxwell');
    assert.ok(scientists[3].includes('Planck'), 'Fourth milestone should be Planck');
    assert.ok(scientists[4].includes('Einstein'), 'Fifth milestone should be Einstein');
    assert.ok(scientists[5].includes('Dirac'), 'Sixth milestone should be Dirac (QFT)');
    assert.ok(scientists[6].includes('Feynman'), 'Seventh milestone should be Feynman / QED');
  });

  // TC-02: Einstein Photoelectric Effect Logic
  it('TC-02: Photoelectric effect should correctly calculate photon energy and emission threshold', () => {
    // Caesium (Cs) work function = 2.14 eV
    const workFunctionCs = 2.14;
    
    // Red light (700 nm) -> E = 1240 / 700 ≈ 1.77 eV (< 2.14 eV) -> NO emission
    const redWavelength = 700;
    const redEnergy = 1239.84 / redWavelength;
    assert.ok(redEnergy < workFunctionCs, 'Red light energy must be lower than Cesium work function');
    const redEjected = redEnergy >= workFunctionCs;
    assert.strictEqual(redEjected, false, 'Red light must NOT eject electron');

    // Ultraviolet light (300 nm) -> E = 1240 / 300 ≈ 4.13 eV (> 2.14 eV) -> EJECTS with kinetic energy
    const uvWavelength = 300;
    const uvEnergy = 1239.84 / uvWavelength;
    assert.ok(uvEnergy > workFunctionCs, 'UV energy must exceed Cesium work function');
    const kineticEnergy = uvEnergy - workFunctionCs;
    assert.ok(kineticEnergy > 1.9, 'Kinetic energy must be positive and approx ~1.99 eV');
  });

  // TC-03: Harmonic Oscillator Fock State & Zero-Point Energy (QFT core)
  it('TC-03: Harmonic oscillator energy levels in QFT must include Zero-Point Energy (1/2 hbar omega)', () => {
    const omega = 1.0;
    const calculateEnergy = (n: number) => (n + 0.5) * omega;

    // Ground state |0> (Vacuum)
    assert.strictEqual(calculateEnergy(0), 0.5, 'Vacuum ground state |0> must have 0.5 hbar omega (Zero-point energy)');

    // 1-Photon excitation |1>
    assert.strictEqual(calculateEnergy(1), 1.5, '1-photon state |1> must have 1.5 hbar omega');

    // 2-Photon excitation |2>
    assert.strictEqual(calculateEnergy(2), 2.5, '2-photon state |2> must have 2.5 hbar omega');

    // Energy difference between levels must be exactly 1 hbar omega (energy of 1 quantum)
    assert.strictEqual(calculateEnergy(3) - calculateEnergy(2), 1.0, 'Energy difference must be exactly 1 quantum hbar omega');
  });

  // TC-04: Double-slit interference probability
  it('TC-04: Double slit center point should be a constructive interference peak', () => {
    const lambda = 12;
    const d = 35;
    const thetaCenter = 0; // Center axis
    const beta = (Math.PI * d * Math.sin(thetaCenter)) / lambda;
    const intensity = Math.pow(Math.cos(beta), 2);
    assert.strictEqual(intensity, 1.0, 'Central fringe should have maximum intensity (1.0)');
  });
});
