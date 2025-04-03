import { test, expect } from '@playwright/test';

// Fill out MainInfo component and verify that data persists through clicks to "Next" and "Prev"
test('fill out maininfo & data persists', async ({ page }) => {
  await page.goto('http://localhost:5173/scenario');
  await page.getByText('New Scenario').click()
  await page.waitForURL("http://localhost:5173/scenario/new")
  const MainInfo = [
    'My Scenario',
    'NY',
    '42069',
    '2004',
    '2004',
    '60',
    '55',
    '15'
  ] as const;

  await page.locator("input[name='name']").fill(MainInfo[0]);
  await page.locator("select[name='state']").selectOption({ value: MainInfo[1] });
  await page.locator("input[name='fin_goal']").fill(MainInfo[2]);
  await page.locator("input[name='birth_year']").fill(MainInfo[3]);
  await page.locator("input[name='is-married']").check()
  await page.locator("input[name='spouse_birth_year']").fill(MainInfo[4]);

  const inputs = await page.locator('input[name="value"]').all();

  await inputs[0].fill(MainInfo[5]);  // Your life expectancy
  await inputs[1].fill(MainInfo[6]);  // Spouse life expectancy
  await inputs[2].fill(MainInfo[7]);   // Inflation assumption

  await page.getByText('Next').click()
  await page.getByText('Prev').click()


  await expect(page.locator("input[name='name']")).toHaveValue(MainInfo[0]);
  await expect(page.locator("select[name='state']")).toHaveValue(MainInfo[1]);
  await expect(page.locator("input[name='fin_goal']")).toHaveValue(MainInfo[2]);
  await expect(page.locator("input[name='birth_year']")).toHaveValue(MainInfo[3]);
  await expect(page.locator("input[name='is-married']")).toBeChecked()
  await expect(page.locator("input[name='spouse_birth_year']")).toHaveValue(MainInfo[4]);
  await expect(inputs[0]).toHaveValue(MainInfo[5]);  // Your life expectancy
  await expect(inputs[1]).toHaveValue(MainInfo[6]);  // Spouse life expectancy
  await expect(inputs[2]).toHaveValue(MainInfo[7]);   // Inflation assumption
});

// Create Investment Type & Investment, and check that they appear on screen
test('create investment type & investment', async ({ page }) => {
  const InvestmentTypeInfo = {
    name: "S&P 500",
    description: "S&P 500 Investment Type",
    exp_annual_return: {
        is_percent: false,
        type: "fixed", // either "fixed" or "normal"
        value: 0,
        mean:0,
        stdev:1,
    },
    exp_annual_income: {
        is_percent: false,
        type: "fixed", // either "fixed" or "normal"
        value: 0,
        mean:0,
        stdev:1,
    },
    expense_ratio: 0.0,
    taxability: false
  } 

  const InvestmentInfo = {
    invest_type: "S&P 500", // are investment types uniquely identified by names?
    value: "6900",
    tax_status: "non-retirement" // is this needed?
  }

  await page.goto('http://localhost:5173/scenario');
  await page.getByText('New Scenario').click();
  await page.waitForURL("http://localhost:5173/scenario/new");
  await page.getByText('Next').click();

  await page.getByText('+ Add an Investment Type', {exact: true}).click();
  await page.locator("input[name='name']").fill(InvestmentTypeInfo.name);
  await page.locator("textarea[name='description']").fill(InvestmentTypeInfo.description);
  await page.getByText('Add', {exact: true}).click();

  
  await page.getByText('+ Add an Investment', {exact: true}).click();
  await page.locator("select[name='invest_type']").selectOption({ value: InvestmentInfo.invest_type });
  await page.locator("input[name='value']").fill(InvestmentInfo.value);
  await page.getByText('Add', {exact: true}).click();

  const div_containers = page.locator('div.bg-white.shadow-md.rounded-lg.p-6.flex.flex-col.gap-3.w-120.h-30.hover\\:bg-sky-100.cursor-pointer');
  let investment_type = div_containers.nth(0);
  let investment = div_containers.nth(1);

  const typeNameText = await investment_type.locator('h2').textContent();
  const typeDescriptionText = await investment_type.locator('p').textContent();
  await expect(typeNameText).toBe(InvestmentTypeInfo.name);
  await  expect(typeDescriptionText).toBe(InvestmentTypeInfo.description);
  
  const investTypeText = await investment.locator('h2').textContent();
  const descriptionText = await investment.locator('p').textContent();
  await expect(investTypeText).toBe(InvestmentInfo.invest_type);
  await expect(descriptionText).toBe(InvestmentInfo.tax_status + ' - $' + InvestmentInfo.value);  
});


// Create Investment Type & Investment, and check that they appear on screen
test('create event series', async ({ page }) => {
  
});
