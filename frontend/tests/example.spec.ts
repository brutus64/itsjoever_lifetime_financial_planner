import { test, expect } from '@playwright/test';

// Fill out MainInfo component and verify that data persists through clicks to "Next" and "Prev"
test('fill out maininfo & data persists', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.getByText('Guest Account').click();
  await page.getByText('New Scenario').click();
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

  await page.getByText('Save').click()
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

  await page.click('.flex.items-center.w-50.gap-5.p-4.hover\\:bg-gray-300.cursor-pointer');
  await page.click('.flex.items-center.gap-2.p-2.hover\\:bg-red-300.cursor-pointer');
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

  await page.goto('http://localhost:5173');
  await page.getByText('Guest Account').click()
  await page.getByText('New Scenario').click();
  await page.getByText('Next').click();

  await page.getByText('+ Add an Investment Type', {exact: true}).click();
  await page.locator("input[name='name']").fill(InvestmentTypeInfo.name);
  await page.locator("textarea[name='description']").fill(InvestmentTypeInfo.description);
  await page.getByText('Add', {exact: true}).click();

  
  await page.getByText('+ Add an Investment', {exact: true}).click();
  await page.locator("select[name='invest_type']").selectOption({ value: InvestmentInfo.invest_type });
  await page.locator("input[name='value']").fill(InvestmentInfo.value);
  await page.getByText('Add', {exact: true}).click();

  const div_containers = page.locator('div.bg-white.shadow-md.rounded-lg.p-6.flex.justify-between.gap-3.w-120.h-30.hover\\:bg-sky-100.cursor-pointer');
  let cash_investment = div_containers.nth(0);
  let investment_type = div_containers.nth(1);
  let retirement_type = div_containers.nth(2);
  let investment = div_containers.nth(3);
  
  const cashNameText = await cash_investment.locator('h2').textContent();
  const cashDescriptionText = await cash_investment.locator('p').textContent();
  await expect(cashNameText).toBe("cash");
  await  expect(cashDescriptionText).toBe("default cash investment");

  const typeNameText = await investment_type.locator('h2').textContent();
  const typeDescriptionText = await investment_type.locator('p').textContent();
  await expect(typeNameText).toBe(InvestmentTypeInfo.name);
  await  expect(typeDescriptionText).toBe(InvestmentTypeInfo.description);

  const retirementNameText = await retirement_type.locator('h2').textContent();
  const retirementDescriptionText = await retirement_type.locator('p').textContent();
  await expect(retirementNameText).toBe("cash");
  await  expect(retirementDescriptionText).toBe("non-retirement - $0");
  
  const investTypeText = await investment.locator('h2').textContent();
  const descriptionText = await investment.locator('p').textContent();
  await expect(investTypeText).toBe(InvestmentInfo.invest_type);
  await expect(descriptionText).toBe(InvestmentInfo.tax_status + ' - $' + InvestmentInfo.value);  

  await page.click('.flex.items-center.w-50.gap-5.p-4.hover\\:bg-gray-300.cursor-pointer');
  await page.click('.flex.items-center.gap-2.p-2.hover\\:bg-red-300.cursor-pointer');
});


// Create income event series, and check that they appear on screen
test('create income event series', async ({ page }) => {
  const IncomeEventInfo = {
    type: "income",
    name: "Social Security",
    description: "Social Security income",
    start_year: {
        type: "fixed", //  "fixed", "uniform", "normal", "start_with", "end_with"
        value: "2026"
    },
    duration: {
        type: "fixed", //fixed, uniform, normal
        value: "20"
    },

    // INCOME/EXPENSE
    initial_amt: "10000",
    exp_annual_change: {
        is_percent: true,
        type: "fixed", // either "fixed" or "normal" or "uniform"
        value: "110",
    },
    inflation_adjust: true,
    user_split: 100.0,
    // INCOME
    social_security: true,
  }
  await page.goto('http://localhost:5173');
  await page.getByText('Guest Account').click();
  await page.getByText('New Scenario').click();
  await page.getByText('Next').click();
  await page.getByText('Next').click();

  await page.getByText('+ Add Income', {exact: true}).click();
  await page.locator("input[name='name']").fill(IncomeEventInfo.name);
  await page.locator("textarea[name='description']").fill(IncomeEventInfo.description);
  await page.locator("input[name='social_security']").check();
  await page.locator("input[name='initial_amt']").fill(IncomeEventInfo.initial_amt);
  

  const value_input_tags = await page.locator('input[name="value"]').all();
  const start_year_radio_buttons = await page.locator('input[name="start_year-type"]').all();
  await start_year_radio_buttons[0].check();  // Check Fixed radio button
  await value_input_tags[0].fill(IncomeEventInfo.start_year.value);

  const duration_radio_buttons = await page.locator('input[name="duration-type"]').all();
  await duration_radio_buttons[0].check();
  await value_input_tags[1].fill(IncomeEventInfo.duration.value);
  
  await page.locator("input[name='inflation_adjust']").check();

  const expected_annual_change_radio_buttons =await page.locator('input[name="exp-is_percent"]').all();
  await expected_annual_change_radio_buttons[1].check();
  const expected_annual_change_value_radio_buttons =await page.locator('input[name="exp-type"]').all();
  await expected_annual_change_value_radio_buttons[0].check();  // Check Fixed radio button
  await value_input_tags[2].fill(IncomeEventInfo.exp_annual_change.value);

  
  await page.getByText('Add', {exact: true}).click();
  const income_event_item_container = page.locator('div.bg-white.shadow-md.rounded-lg.p-4.flex.w-full.hover\\:bg-sky-100');

  await expect(income_event_item_container.locator('p').nth(0)).toHaveText('$'+IncomeEventInfo.initial_amt);
  await expect(income_event_item_container.locator('h2')).toHaveText(IncomeEventInfo.name);
  await expect(income_event_item_container.locator('p').nth(1)).toHaveText(IncomeEventInfo.description);

  await page.click('.flex.items-center.w-50.gap-5.p-4.hover\\:bg-gray-300.cursor-pointer');
  await page.click('.flex.items-center.gap-2.p-2.hover\\:bg-red-300.cursor-pointer');
});
