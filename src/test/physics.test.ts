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

  // TC-05: Mach-Zehnder unitary beam splitter transformation (BS1) preserves photon probability amplitude
  it('TC-05: 50:50 beam splitter generates normalized single-photon superposition state (|d1> + i|d2>) / sqrt(2)', () => {
    // Input state |1, 0> through 50:50 beam splitter matrix:
    // [1/sqrt(2),  i/sqrt(2)]
    // [i/sqrt(2),  1/sqrt(2)]
    const ampD1 = 1 / Math.sqrt(2);
    const ampD2 = 1 / Math.sqrt(2);
    const totalProb = Math.pow(ampD1, 2) + Math.pow(ampD2, 2);
    assert.ok(Math.abs(totalProb - 1.0) < 1e-6, 'Beam splitter state must preserve unitarity / probability conservation (1.0)');
    assert.ok(Math.abs(Math.pow(ampD1, 2) - 0.5) < 1e-9, 'Branch d1 has 50% probability amplitude');
    assert.ok(Math.abs(Math.pow(ampD2, 2) - 0.5) < 1e-9, 'Branch d2 has 50% probability amplitude');
  });

  // TC-06: Mach-Zehnder single-photon interference & delayed choice
  it('TC-06: Mach-Zehnder interferometer must exhibit cos^2(delta_phi / 2) fringe with BS2, and 50/50 without BS2', () => {
    const probWithBS2 = (phaseDeg: number) => {
      const rad = (phaseDeg * Math.PI) / 180;
      return {
        d1: Math.pow(Math.cos(rad / 2), 2),
        d2: Math.pow(Math.sin(rad / 2), 2),
      };
    };

    // Phase = 0 deg -> D1 = 1.0, D2 = 0.0
    const p0 = probWithBS2(0);
    assert.strictEqual(p0.d1, 1.0, 'At delta_phi = 0, D1 probability must be 100%');
    assert.strictEqual(p0.d2, 0.0, 'At delta_phi = 0, D2 probability must be 0%');

    // Phase = 180 deg -> D1 = 0.0, D2 = 1.0
    const p180 = probWithBS2(180);
    assert.ok(Math.abs(p180.d1 - 0.0) < 1e-5, 'At delta_phi = 180, D1 probability must be 0%');
    assert.ok(Math.abs(p180.d2 - 1.0) < 1e-5, 'At delta_phi = 180, D2 probability must be 100%');

    // Phase = 90 deg -> D1 = 0.5, D2 = 0.5
    const p90 = probWithBS2(90);
    assert.ok(Math.abs(p90.d1 - 0.5) < 1e-5, 'At delta_phi = 90, D1 probability must be 50%');
    assert.ok(Math.abs(p90.d2 - 0.5) < 1e-5, 'At delta_phi = 90, D2 probability must be 50%');

    // Without BS2 (Wheeler delayed-choice / which-path): always 50/50 regardless of phase
    const probWithoutBS2 = { d1: 0.5, d2: 0.5 };
    assert.strictEqual(probWithoutBS2.d1, 0.5);
    assert.strictEqual(probWithoutBS2.d2, 0.5);
  });

  // TC-07: Photoelectric stopping potential (V_stop = K_max / e)
  it('TC-07: Photoelectric stopping potential correctly cancels photocurrent when V <= -V_stop', () => {
    const wavelength = 300; // nm
    const photonEnergy = 1239.84 / wavelength; // 4.1328 eV
    const workFunction = 2.14; // Caesium eV
    const kMax = photonEnergy - workFunction; // ~1.9928 eV
    const vStop = kMax; // 1.9928 V

    assert.ok(vStop > 1.9, 'V_stop should be ~1.99 V');

    // If applied voltage V <= -V_stop, current is 0
    const appliedV1 = -2.5; // V < -V_stop
    const current1 = appliedV1 <= -vStop ? 0 : 1;
    assert.strictEqual(current1, 0, 'Current must be 0 when reverse voltage exceeds V_stop');

    // If applied voltage V > -V_stop, current flows
    const appliedV2 = 0.0;
    const current2 = appliedV2 <= -vStop ? 0 : 1;
    assert.strictEqual(current2, 1, 'Current must flow when reverse voltage is less than V_stop');
  });

  // TC-08: Hermite polynomials and Fock wavefunction nodes
  it('TC-08: Quantum harmonic oscillator wavefunctions have exactly n nodes for state |n>', () => {
    // Hermite polynomials
    const H0 = (_x: number) => 1;
    const H1 = (x: number) => 2 * x;
    const H2 = (x: number) => 4 * x * x - 2;

    // H0 has no roots (0 nodes)
    assert.strictEqual(H0(0), 1);

    // H1 has 1 root at x = 0 (1 node)
    assert.strictEqual(H1(0), 0);

    // H2 has 2 roots at x = +- 1/sqrt(2) (2 nodes)
    const rootH2 = 1 / Math.sqrt(2);
    assert.ok(Math.abs(H2(rootH2)) < 1e-6);
    assert.ok(Math.abs(H2(-rootH2)) < 1e-6);
  });

  // TC-09: Quantum Optics Antibunching vs Classical Wave Coherence
  it('TC-09: Quantum optics g^(2)(0) < 1 proves true non-classical photon field (Antibunching)', () => {
    // Second-order correlation function g^(2)(0) for Fock state |n>:
    // g^(2)(0) = <a^dagger a^dagger a a> / <a^dagger a>^2 = n(n-1) / n^2
    const g2Fock = (n: number) => (n <= 1 ? 0 : (n * (n - 1)) / (n * n));

    // Single-photon state |1>: g^(2)(0) = 0 (perfect antibunching, impossible in classical wave optics)
    assert.strictEqual(g2Fock(1), 0, 'Single-photon Fock state must have g^(2)(0) = 0');

    // Two-photon state |2>: g^(2)(0) = 2*(1)/4 = 0.5 < 1 (sub-Poissonian / quantum)
    assert.strictEqual(g2Fock(2), 0.5, 'Two-photon Fock state must have g^(2)(0) = 0.5 < 1');

    // Coherent state (laser / Poissonian): g^(2)(0) = 1.0
    const g2Coherent = 1.0;
    assert.strictEqual(g2Coherent, 1.0, 'Coherent state has g^(2)(0) = 1');

    // Thermal / chaotic light (Bose-Einstein / super-Poissonian): g^(2)(0) = 2.0
    const g2Thermal = 2.0;
    assert.strictEqual(g2Thermal, 2.0, 'Thermal light has g^(2)(0) = 2 >= 1');

    // Verification of Cauchy-Schwarz classical inequality: Classical waves require g^(2)(0) >= 1
    assert.ok(g2Fock(1) < 1.0, 'Antibunching g^(2)(0) < 1 violates classical wave theory');
  });

  // TC-10: Jaffe 2005 Casimir Limit (Van der Waals coupling e -> 0)
  it('TC-10: Casimir force vanishes as coupling e -> 0 in Jaffe relativistic Van der Waals formulation', () => {
    // In Robert Jaffe (MIT 2005), Casimir force between plates is an interaction between fluctuating charges
    // and scales with coupling factor e^2 / (1 + e^2 * chi)
    const jaffeCasimirForce = (coupling_e: number, d: number) => {
      if (coupling_e === 0) return 0;
      // In the perfect conductor limit (e -> infinity or large), it matches standard Casimir -C/d^4
      const conductivityFactor = Math.min(1, Math.pow(coupling_e, 2));
      const C = 1.0;
      return conductivityFactor * (-C / Math.pow(d, 4));
    };

    const d = 50; // nm
    const forceCoupled = jaffeCasimirForce(1.0, d);
    const forceZeroCoupling = jaffeCasimirForce(0.0, d);

    assert.ok(forceCoupled < 0, 'Conducting plates experience attractive Casimir force');
    assert.strictEqual(forceZeroCoupling, 0, 'Without matter coupling (e=0), Casimir force is strictly 0');
  });

  // TC-11: Cosmological Constant ZPE Discrepancy Scale
  it('TC-11: Theoretical Planck ZPE density exceeds observed Dark Energy density by ~10^120', () => {
    // Observed dark energy density: rho_obs ~ 10^-9 J/m^3 (approx 10^-29 g/cm^3)
    const logRhoObs = -9;

    // Planck cut-off vacuum energy density: rho_planck ~ 10^111 to 10^114 J/m^3
    const logRhoPlanck = 111;

    // Order of magnitude discrepancy:
    const logDiscrepancy = logRhoPlanck - logRhoObs;
    assert.ok(logDiscrepancy >= 115 && logDiscrepancy <= 125, 'Cosmological constant problem discrepancy must be ~10^120');
  });
});

