import { FormelFlashcard } from '../types';

export const initialFormelnData: FormelFlashcard[] = [
  {
    id: 'formel-001',
    front: 'Werkstoffverbrauch (Verbrauch)',
    back: 'Formel: Anfangsbestand + Zugänge − Endbestand\n\nRechenbeispiel: 11.500 + 127.290 − 11.200 = 127.590 €'
  },
  {
    id: 'formel-002',
    front: 'Gesamtkosten (Totalkosten)',
    back: 'Formel: Werkstoffe + Löhne (direkt) + Gemeinkosten + Sondereinzelkosten\n\nRechenbeispiel: 127.590 + 445.745 + 612.030 + 55.000 = 1.240.365 €'
  },
  {
    id: 'formel-003',
    front: 'Betriebsergebnis (Gewinn/Verlust)',
    back: 'Formel: Betriebsleistung − Gesamtkosten\n\nRechenbeispiel: 1.831.840 − 1.240.365 = 591.475 €'
  },
  {
    id: 'formel-004',
    front: 'Gemeinkostenzuschlag (%)',
    back: 'Formel: (Gemeinkosten ÷ Direkt verrechenbare Lohnkosten) × 100\n\nRechenbeispiel: 612.030 ÷ 445.745 × 100 = 137,3 %'
  },
  {
    id: 'formel-005',
    front: 'Lohnkostenpreis Faktor',
    back: 'Formel: 100% + Gemeinkosten-Zuschlag + Wagnis & Gewinn\n\nRechenbeispiel: 100 + 137,3 + 18,98 = 256,3 % (Faktor: 2.5628)'
  },
  {
    id: 'formel-006',
    front: 'Lohnkostenpreis pro Std.',
    back: 'Formel: Durchschnittslohn × Faktor Lohnkostenpreis\n\nRechenbeispiel: 17,58 € × 2.5628 = 45,05 €'
  },
  {
    id: 'formel-007',
    front: 'Lohnkostenpreis pro Min.',
    back: 'Formel: Stundenpreis ÷ 60\n\nRechenbeispiel: 45,05 € ÷ 60 = 0,75 €'
  },
  {
    id: 'formel-008',
    front: 'Wie berechnet man die Wertschöpfung pro Stunde?',
    back: 'Wertschöpfung = Betriebsleistungen - Materialverbrauch'
  },
  {
    id: 'formel-009',
    front: 'Wie lautet die Formel für den Deckungsbeitrag pro Stunde?',
    back: 'Deckungsbeitrag = Wertschöpfung - Direkt verrechenbarer Lohn'
  },
  {
    id: 'formel-010',
    front: 'Wie berechnet man leistungsabhängige Gemeinkosten?',
    back: 'Gemeinkosten = Direkt verrechenbarer Lohn × Prozentsatz'
  },
  {
    id: 'formel-011',
    front: 'Wie wird die Gewinnschwelle (Break-even Punkt) berechnet?',
    back: 'Gewinnschwelle = Fixkosten / Deckungsbeitrag pro Stunde'
  },
  {
    id: 'formel-012',
    front: 'Wie berechnet man die Auslastung in Prozent?',
    back: 'Auslastung = (Gewinnschwelle / Produktive Stunden pro Jahr) × 100'
  },
  {
    id: 'formel-013',
    front: 'Wie wird der Werkstoffverbrauch berechnet?',
    back: 'Werkstoffverbrauch = Anfangsbestand + Zugang - Endbestand'
  },
  {
    id: 'formel-014',
    front: 'Wie berechnet man den Gemeinkostenzuschlagssatz (GKZ)?',
    back: 'GKZ (%) = (Gemeinkosten / Direkt verrechenbare Lohnkosten) × 100'
  },
  {
    id: 'formel-015',
    front: 'Wie berechnet man die Selbstkosten je Stunde?',
    back: 'Selbstkosten = Mittlerer Stundenlohn + GKZ-Betrag'
  },
  {
    id: 'formel-016',
    front: 'Wie berechnet man den Zuschlag für Wagnis und Gewinn?',
    back: 'Zuschlag = Selbstkosten × Prozentsatz'
  },
  {
    id: 'formel-017',
    front: 'Wie berechnet man den Stundenverrechnungssatz?',
    back: 'Stundenverrechnungssatz = Selbstkosten + Zuschlag'
  },
  {
    id: 'formel-018',
    front: 'Wie berechnet man die Gemeinkosten aus Einzelkosten?',
    back: 'Einzelkosten × Gemeinkostenzuschlag (%) = Gemeinkosten'
  },
  {
    id: 'formel-019',
    front: 'Wie berechnet man den Selbstkostenpreis?',
    back: 'Selbstkosten = Einzelkosten + Gemeinkosten'
  },
  {
    id: 'formel-020',
    front: 'Wie berechnet man den Angebotspreis?',
    back: 'Angebotspreis = Selbstkosten + Gewinn'
  }
];
