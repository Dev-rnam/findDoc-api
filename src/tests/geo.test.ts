import { getBoundingBox } from "../utils/geo";


describe('Fonction getBoundingBox', () => {
  it('doit calculer la bonne zone de délimitation', () => {
    const lat = 4.0511; // Douala
    const lng = 9.7679;
    const radius = 5; // 5 km

    const box = getBoundingBox(lat, lng, radius);

    // On vérifie que les valeurs sont proches de ce qu'on attend
    expect(box.minLat).toBeCloseTo(3.9999, 4);
    expect(box.maxLat).toBeCloseTo(4.0901, 4);
    expect(box.minLng).toBeCloseTo(9.7157, 4);
    expect(box.maxLng).toBeCloseTo(9.8101, 4);
  });
});