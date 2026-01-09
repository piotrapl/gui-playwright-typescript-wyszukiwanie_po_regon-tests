// Importuję test i expect z customowej fukstury (custom fixture) zdefiniowanej w regon.fixture.ts
// Ta fikstura: 1. rozszerza standardową fiksturę Playwright 
// 2. stronę regonPage z metodami do interakcji z aplikacją, 
//    (wstrzykuje ją do każdego testu)
// 3. Enkapsuluje logikę: a. wyszukiwania wg REGON, b. odczytywania komunikatów błędów
//    c. odczytywania rezultatu (nazwy firmy) z wyników wyszukiwania 

// Dane testowe są w tablicach obiektów (negativeCases, positiveCases), 
// a testy iterują przez te tablice (data-driven testing).

// poniżej: definicja test suite: grupuje wszystkie testy związane z wyszukiwaniem wg REGON
// beforeEach przed każdym testem m.in. otwiera stronę wyszukiwania wg REGON

import { test, expect } from './fixtures/regon.fixture';                                
test.describe('Wyszukiwanie podmiotów wg REGON – ', () => {

  test.beforeEach(async ({ regonPage }) => {
    await regonPage.open();
  });

  // tablice negativeCases, positiveCases:
  // pola: expectedRegex - wyrażenie regularne do weryfikacji komunikatów błędów
  //       expectedCompanyRegex - wyrażenie regularne do weryfikacji nazwy firmy w wynikach wyszukiwania 

  // ---------------------------
  // test case'y negatywne
  // ---------------------------
  const negativeCases = [
    {
      title: 'Liczba znaków w polu REGON (8) jest inna niż 9 lub 14',
      regon: '12345678',
      expectedRegex: /długość|liczba|zawiera|zawierać|.*9.*14|znaków/i
    },
    {
      title: 'Liczba znaków w polu REGON (10) jest inna niż 9 lub 14',
      regon: '1234567891',
      expectedRegex: /długość|liczba|zawiera|zawierać|.*9.*14|znaków/i
    },
    {
      title: 'Podany REGON 9-znakowy: nieprawidłowy - błędna cyfra kontrolna)',
      regon: '123456789',
      expectedRegex: /nieprawidłowy|nieprawidłowa|błędny|błędna/i
    },
    {
      title: 'Podany REGON 14-znakowy jest nieprawidłowy - błędna cyfra kontrolna)',
      regon: '12345678901234',
      expectedRegex: /nieprawidłowy|nieprawidłowa|błędny|błędna/i
    },
    {
      title: 'Podany REGON 9-znakowy jest nieprawidłowy - zawiera minimum 1 znak inny niż cyfra',
      regon: '1234567AB',
      expectedRegex: /nieprawidłowy|nieprawidłowa|błędny|błędna/i
    },
    {
      title: 'Podany REGON 14-znakowy jest nieprawidłowy - zawiera minimum 1 znak inny niż cyfra',
      regon: '123456789012CD',
      expectedRegex: /nieprawidłowy|nieprawidłowa|błędny|błędna/i
    }
  ];

  for (const testCase of negativeCases) {
    test(`Test NEGATYWNY – ${testCase.title}`, async ({ regonPage }) => {
      await regonPage.searchByRegon(testCase.regon);

      const errorMessage = await regonPage.getErrorMessage();
      expect(errorMessage).toMatch(testCase.expectedRegex);
    });
  }

  // ---------------------------
  // test case'y pozytywne
  // ---------------------------
  const positiveCases = [
    {
      title: 'prawidłowy REGON 9-cyfrowy',
      regon: '350637551',
      expectedCompanyRegex: /RADIO MUZYKA FAKTY GRUPA RMF/i
    },
    {
      title: 'prawidłowy REGON 14-cyfrowy',
      regon: '01041897300057',
      expectedCompanyRegex: /TELEWIZJA POLSKA.*RZESZOWIE|TELEWIZJA POLSKA.*RZESZÓW/i
    }
  ];

  for (const testCase of positiveCases) {
    test(`Test POZYTYWNY – ${testCase.title}`, async ({ regonPage }) => {
      await regonPage.searchByRegon(testCase.regon);

      const companyName = await regonPage.getCompanyName();
      expect(companyName).toMatch(testCase.expectedCompanyRegex);
    });
  }

});