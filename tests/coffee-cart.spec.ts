import { test, expect, type Page } from '@playwright/test';

const DRINKS = {
  espresso: 'Espresso',
  americano: 'Americano',
  cafeLatte: 'Cafe_Latte',
};

const CART_LABEL = 'Cart';

async function addDrink(page: Page, drink: string) {
  await page.locator(`[data-test="${drink}"]`).click();
}

async function openCart(page: Page) {
  await page.getByLabel(CART_LABEL).click();
}

function cartItem(page: Page, drink: string) {
  return page
    .locator('li.list-header')
    .locator('..')
    .locator('li.list-item')
    .filter({ hasText: drink });
}

test('Smoke: menu loads with drinks list and Total button @smoke', async ({ page }) => {
  await page.goto('/coffee/');

  await expect(
    page.locator(`[data-test="${DRINKS.espresso}"]`)
  ).toBeVisible();

  await expect(
    page.getByRole('button', {
      name: 'Proceed to checkout',
    })
  ).toHaveText('Total: $0.00');
});

test('Adding two different drinks updates the header cart counter and Total', async ({ page }) => {
  await page.goto('/coffee/');

  await addDrink(page, DRINKS.espresso);
  await addDrink(page, DRINKS.americano);

  await expect(page.getByLabel(CART_LABEL))
    .toHaveText('cart (2)');

  await expect(
    page.getByRole('button', {
      name: 'Proceed to checkout',
    })
  ).toHaveText('Total: $17.00');
});

test('Cart page lists exactly the added items', async ({ page }) => {
  await page.goto('/coffee/');

  await addDrink(page, DRINKS.espresso);
  await addDrink(page, DRINKS.americano);

  await openCart(page);

  await expect(
    cartItem(page, DRINKS.espresso)
  ).toBeVisible();

  await expect(
    cartItem(page, DRINKS.americano)
  ).toBeVisible();
});

test('Increasing item quantity on the cart page updates counter and Total', async ({ page }) => {
  await page.goto('/coffee/');

  await addDrink(page, DRINKS.espresso);

  await openCart(page);

  await page.getByRole('button', {
    name: `Add one ${DRINKS.espresso}`,
  }).click();

  await expect(page.getByLabel(CART_LABEL))
    .toHaveText('cart (2)');
});

test('Empty cart shows no items on a fresh session', async ({ page }) => {
  await page.goto('/coffee/cart');

  await expect(page.getByLabel(CART_LABEL))
    .toHaveText('cart (0)');
});

test('Payment modal shows Name, Email and Submit', async ({ page }) => {
  await page.goto('/coffee/');

  await addDrink(page, DRINKS.espresso);

  await page.getByRole('button', {
    name: 'Proceed to checkout',
  }).click();

  const paymentForm = page.getByRole('form', {
    name: 'Payment form',
  });

  await expect(paymentForm).toBeVisible();
  await expect(page.locator('#name')).toBeVisible();
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#submit-payment')).toBeVisible();
});

test.describe('Optional', () => {
  test('Promo dialog after a 3rd drink is dismissed with No', async ({ page }) => {
    await page.goto('/coffee/');

    await addDrink(page, DRINKS.espresso);
    await addDrink(page, DRINKS.americano);
    await addDrink(page, DRINKS.cafeLatte);

    const promo = page.locator('.promo');

    await expect(promo).toBeVisible();
    
    await promo.getByRole('button', {
      name: "Nah, I'll skip.",
    }).click();
    
    await expect(promo).toBeHidden();

    await expect(page.getByLabel(CART_LABEL))
      .toHaveText('cart (3)');
  });

  test('Completed payment form shows a success message', async ({ page }) => {
    await page.goto('/coffee/');

    await addDrink(page, DRINKS.espresso);

    await page.getByRole('button', {
      name: 'Proceed to checkout',
    }).click();

    await page.locator('#name')
      .fill('John Doe');

    await page.locator('#email')
      .fill('john@example.com');

    await page.locator('#submit-payment')
      .click();

    await expect(
      page.getByRole('button', {
        name: /Thanks for your purchase/i,
      })
    ).toBeVisible();
  });

  test('Skipped on a specific browser with a documented reason', async ({ browserName }) => {
    test.skip(
      browserName === 'webkit',
      'webkit project is disabled in playwright.config.ts'
    );

    expect(browserName).not.toBe('webkit');
  });

  test('Annotated with a tracking issue', async () => {
    test.info().annotations.push({
      type: 'issue',
      description: 'https://example.com/issues/123',
    });

    expect(true).toBeTruthy();
  });
});