// definujemy alias dla test (base) bo później rozszerzamy go o nasze fikstury 
import { test as base, expect, Page } from '@playwright/test';

// definiujemy typy dla naszych fikstur
// w tym przypadku fikstura regonPage zawiera metody do interakcji ze stroną
// (to customowe akcje, tzw. custom actions albo custom helpers)
// takie jak otwieranie strony, wyszukiwanie po numerze REGON, pobieranie komunikatów o błędach i nazwy firmy

// każda metoda zwraca Promise, bo operacje te są asynchroniczne
// i wymagają oczekiwania na zakończenie działań w przeglądarce
// dzięki temu możemy korzystać z tych metod w naszych testach w sposób asynchroniczny
// (typowe w testach end-to-end z Playwright)

type RegonFixtures = {
  regonPage: {
    open: () => Promise<void>;
    searchByRegon: (value: string) => Promise<void>;
    getErrorMessage: () => Promise<string>;
    getCompanyName: () => Promise<string>;
  };
};
// regonPage to jest Page Object dla strony wyszukiwarki
// To jest podobne do Page Object Model (POM) ale implementowane jako fixture w Playwright
// dzięki temu możemy łatwo zarządzać interakcjami ze stroną w naszych testach

// Rozszerzamy obiekt testu Playwright o naszą customową fiksturę regonPage
// teraz w testach możemy używać test.regonPage do interakcji ze stroną wyszukiwarki
// page - jest zapewniane automatycznie przez Playwright (karta przeglądarki)
// use - funkcja do przekazania naszej fikstury do testu, zapewnia naszemu testowi dostęp do regonPage (fikstury)
     // use to jest 'callback' 
     // ='funkcja zwrotna', która pozwala nam przekazać naszą fiksturę do testu
     // 'callback' bo wołana jest PÓŹNIEJ kiedy fikstura jest gotowa
// używamy await przy operacjach na stronie, bo są asynchroniczne
//   zapewnia to, że operacje zakończą się zanim przejdziemy dalej w kodzie testu
//   to jest kluczowe dla stabilności testów end-to-end

export const test = base.extend<RegonFixtures>({
  regonPage: async ({ page }, use) => {

    const regonPage = {
      open: async () => {
        await page.goto('https://wyszukiwarkaregon.stat.gov.pl/appBIR/index.aspx');
      },

      searchByRegon: async (value: string) => {
        await page.locator('#txtRegon').fill(value);
        await page.getByRole('button', { name: /szukaj/i }).click();
      },

      getErrorMessage: async () => {
        const error = page.locator('#divInfoKomunikat');
        await expect(error).toBeVisible();
        return (await error.innerText()).trim();
      },

      getCompanyName: async () => {
        const name = page.locator('table >> text=/(spółka|oddział|Sp\\. z o\\. o\\.|Sp\\. z o\\.o\\.|S\\. A\\.|S\\.A\\.)/i').first()
        await expect(name).toBeVisible();
        return (await name.innerText()).trim();
      }
    };

    await use(regonPage);
  }
});

export { expect };

// Na końcu używamy await use(regonPage) 
// aby przekazać naszą fiksturę do testu
// to pozwala testom korzystać z regonPage do interakcji ze stroną
//  - tak tworzymy modularne i wielokrotnego użytku komponenty do testów end-to-end
//     co poprawia czytelność i utrzymanie kodu testów

// 1. Playwright startuje test 
// 2. widzi że test potrzebuje `regonPage`
// 3. --> uruchamia funkcję fikstury
// 4. wywołujemy `use(regonPage)`
// 5. Playwright wstrzykuje `regonPage` do testu
// 6. Test może teraz wywoływać regonPage.open(), itd.

// Fikstury można porównać do dependency injection (wstrzykiwania zależności)
// Fikstura przygotowuje dane
//        ↓
//   use(fixture)
//        ↓
// Test otrzymuje fiksturę jako zależność

//  - Playwright zarządza cyklem życia fikstur
//  - tworzy je przed testem i niszczy po teście
//  - to pozwala na izolację testów i unikanie konfliktów między nimi

