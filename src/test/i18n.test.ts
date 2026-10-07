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
});

