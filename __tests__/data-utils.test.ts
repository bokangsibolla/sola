import { getEmergencyNumbers } from '../data/safety';
import { getGreeting } from '../data/greetings';
import { countries } from '../data/geo';

describe('getEmergencyNumbers', () => {
  it('returns correct numbers for US', () => {
    const nums = getEmergencyNumbers('US');
    expect(nums.police).toBe('911');
    expect(nums.ambulance).toBe('911');
    expect(nums.fire).toBe('911');
  });

  it('returns correct numbers for Japan', () => {
    const nums = getEmergencyNumbers('JP');
    expect(nums.police).toBe('110');
    expect(nums.ambulance).toBe('119');
  });

  it('returns default numbers for unknown country', () => {
    const nums = getEmergencyNumbers('XX');
    expect(nums.police).toBeDefined();
    expect(nums.ambulance).toBeDefined();
    expect(nums.fire).toBeDefined();
  });

  it('returns correct numbers for a European country (DE)', () => {
    const nums = getEmergencyNumbers('DE');
    expect(nums.police).toBe('110');
    expect(nums.general).toBe('112');
  });
});

describe('getGreeting', () => {
  it('returns Japanese greeting for JP', () => {
    expect(getGreeting('JP')).toBe('ようこそ');
  });

  it('returns Spanish greeting for ES', () => {
    expect(getGreeting('ES')).toBe('Bienvenida');
  });

  it('returns null for unknown country', () => {
    expect(getGreeting('XX')).toBeNull();
  });

  it('returns a string for Thailand', () => {
    expect(typeof getGreeting('TH')).toBe('string');
  });
});

describe('countries geo data', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.length).toBeGreaterThan(100);
  });

  it('each country has required fields', () => {
    for (const c of countries.slice(0, 10)) {
      expect(c.name).toBeTruthy();
      expect(c.iso2).toBeTruthy();
      expect(c.iso2.length).toBe(2);
    }
  });

  it('can find United States by iso2', () => {
    const us = countries.find((c) => c.iso2 === 'US');
    expect(us).toBeDefined();
    expect(us!.name).toContain('United States');
  });

  it('can find Japan by iso2', () => {
    const jp = countries.find((c) => c.iso2 === 'JP');
    expect(jp).toBeDefined();
    expect(jp!.name).toBe('Japan');
  });
});
