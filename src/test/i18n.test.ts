import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { viTranslations } from '../i18n/locales/vi.ts';
import { enTranslations } from '../i18n/locales/en.ts';
import { getTimelineMilestones } from '../data/timelineData.ts';
import { isVietnamTimezone, isVietnameseLocale } from '../i18n/detector.ts';

describe('i18n & Language Detection Test Suite', () => {
  it('TC-I18N-01: Both Vietnamese and English dictionaries must have matching top-level keys', () => {
    const viKeys = Object.keys(viTranslations).sort();
    const enKeys = Object.keys(enTranslations).sort();
    assert.deepStrictEqual(viKeys, enKeys, 'Top-level keys in VI and EN translations must match');
  });

  it('TC-I18N-02: Navigation and Hero strings must be non-empty in both languages', () => {
    assert.ok(viTranslations.nav.title.length > 0);
    assert.ok(enTranslations.nav.title.length > 0);
    assert.ok(viTranslations.hero.mainTitleLine1.length > 0);
    assert.ok(enTranslations.hero.mainTitleLine1.length > 0);
    assert.notStrictEqual(viTranslations.hero.mainTitleLine1, enTranslations.hero.mainTitleLine1);
  });

  it('TC-I18N-03: Timeline milestones must return 7 milestones in both Vietnamese and English', () => {
    const viMilestones = getTimelineMilestones('vi');
    const enMilestones = getTimelineMilestones('en');

    assert.strictEqual(viMilestones.length, 7);
    assert.strictEqual(enMilestones.length, 7);

    // English milestones must have translated English text
    assert.ok(enMilestones[0].title.includes('Light as High-Speed'));
    assert.ok(viMilestones[0].title.includes('Ánh sáng là những hạt'));

    assert.ok(enMilestones[1].title.includes('Light Interferes Like Water Ripples'));
    assert.ok(viMilestones[1].title.includes('Ánh sáng giao thoa'));
  });

  it('TC-I18N-04: Photoelectric metals and color translations must be present in both locales', () => {
    assert.ok(viTranslations.labs.photoelectric.metals.cesium.includes('Xesi'));
    assert.ok(enTranslations.labs.photoelectric.metals.cesium.includes('Cesium'));

    assert.strictEqual(viTranslations.labs.photoelectric.colors.red, 'Đỏ');
    assert.strictEqual(enTranslations.labs.photoelectric.colors.red, 'Red');
  });

  it('TC-I18N-05: Detector helper functions run safely without crashing in Node runtime', () => {
    const tzCheck = isVietnamTimezone();
    const localeCheck = isVietnameseLocale();
    assert.strictEqual(typeof tzCheck, 'boolean');
    assert.strictEqual(typeof localeCheck, 'boolean');
  });

  it('TC-I18N-06: Myths translations must have 4 items with non-empty fields in both languages', () => {
    assert.strictEqual(viTranslations.myths.items.length, 4);
    assert.strictEqual(enTranslations.myths.items.length, 4);

    for (let i = 0; i < 4; i++) {
      assert.strictEqual(viTranslations.myths.items[i].id, enTranslations.myths.items[i].id);
      assert.ok(viTranslations.myths.items[i].myth.length > 10);
      assert.ok(enTranslations.myths.items[i].myth.length > 10);
      assert.ok(viTranslations.myths.items[i].reality.length > 10);
      assert.ok(enTranslations.myths.items[i].reality.length > 10);
      assert.ok(viTranslations.myths.items[i].analogy.length > 10);
      assert.ok(enTranslations.myths.items[i].analogy.length > 10);
    }
  });

  it('TC-I18N-07: Tour translations must have 4 progressive steps in both languages', () => {
    assert.strictEqual(viTranslations.tour.steps.length, 4);
    assert.strictEqual(enTranslations.tour.steps.length, 4);

    for (let i = 0; i < 4; i++) {
      assert.strictEqual(viTranslations.tour.steps[i].step, i + 1);
      assert.strictEqual(enTranslations.tour.steps[i].step, i + 1);
      assert.ok(viTranslations.tour.steps[i].title.length > 5);
      assert.ok(enTranslations.tour.steps[i].title.length > 5);
    }
  });

  it('TC-I18N-08: Modern perspectives must have 4 detailed pillars with non-empty fields in both languages', () => {
    const viMP = viTranslations.modernPerspectives;
    const enMP = enTranslations.modernPerspectives;

    assert.ok(viMP.sectionTitle.length > 0);
    assert.ok(enMP.sectionTitle.length > 0);

    const pillarKeys = ['ontology', 'vacuumCrisis', 'semiclassical', 'beyondQft'] as const;
    for (const key of pillarKeys) {
      assert.ok(viMP.pillars[key].title.length > 5, `VI pillar ${key} must have a non-empty title`);
      assert.ok(enMP.pillars[key].title.length > 5, `EN pillar ${key} must have a non-empty title`);
      assert.ok(viMP.pillars[key].takeaway.length > 10, `VI pillar ${key} must have a takeaway`);
      assert.ok(enMP.pillars[key].takeaway.length > 10, `EN pillar ${key} must have a takeaway`);
    }

    // Academic caveats in Photoelectric lab and Modern Perspectives
    assert.ok(viTranslations.labs.photoelectric.academicCaveatTitle.includes('Bán Cổ Điển'));
    assert.ok(enTranslations.labs.photoelectric.academicCaveatTitle.includes('Semiclassical'));
    assert.ok(viMP.pillars.vacuumCrisis.jaffeCritiqueTitle.includes('Robert Jaffe'));
    assert.ok(enMP.pillars.vacuumCrisis.jaffeCritiqueTitle.includes('Robert Jaffe'));
  });
});


