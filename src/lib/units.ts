import { MeasurementSystem } from '../store/usePreferencesStore';

/**
 * Formats and converts a quantity and unit based on the active measurement system.
 */
export function formatQuantityAndUnit(
  quantity: number | string,
  unit?: string,
  system: MeasurementSystem = 'metric'
): { quantity: string; unit: string } {
  const numQty = typeof quantity === 'number' ? quantity : parseFloat(quantity);
  if (isNaN(numQty) || !unit) {
    return { quantity: String(quantity || ''), unit: unit || '' };
  }

  const cleanUnit = unit.trim().toLowerCase();

  if (system === 'imperial') {
    if (['g', 'gram', 'grams', 'gramo', 'gramos'].includes(cleanUnit)) {
      const oz = numQty / 28.3495;
      return { quantity: oz < 1 ? oz.toFixed(2) : oz.toFixed(1), unit: 'oz' };
    }
    if (['kg', 'kilo', 'kilogram', 'kilograms', 'kilos'].includes(cleanUnit)) {
      const lbs = numQty * 2.20462;
      return { quantity: lbs.toFixed(1), unit: 'lbs' };
    }
    if (['ml', 'milliliter', 'milliliters', 'militro', 'militros'].includes(cleanUnit)) {
      const flOz = numQty / 29.5735;
      return { quantity: flOz < 1 ? flOz.toFixed(2) : flOz.toFixed(1), unit: 'fl oz' };
    }
    if (['l', 'liter', 'liters', 'litro', 'litros'].includes(cleanUnit)) {
      const flOz = numQty * 33.814;
      return { quantity: flOz.toFixed(1), unit: 'fl oz' };
    }
  } else if (system === 'metric') {
    if (['oz', 'ounce', 'ounces', 'onza', 'onzas'].includes(cleanUnit)) {
      const g = numQty * 28.3495;
      return { quantity: g > 10 ? Math.round(g).toString() : g.toFixed(1), unit: 'g' };
    }
    if (['lb', 'lbs', 'pound', 'pounds', 'libra', 'libras'].includes(cleanUnit)) {
      const kg = numQty / 2.20462;
      return { quantity: kg.toFixed(2), unit: 'kg' };
    }
    if (['fl oz', 'floz'].includes(cleanUnit)) {
      const ml = numQty * 29.5735;
      return { quantity: Math.round(ml).toString(), unit: 'ml' };
    }
  }

  return { quantity: String(quantity), unit };
}
