from app.scrape.Scraper import Scraper
from app.models.tax import FederalTax, StateTax, StandardDeduct, CapitalGains, RMDTable, Bracket, StateBracket, Distribution

async def scraped_db_check():
    fed = await FederalTax.find_all().to_list()
    state_res = await StateTax.find_all().to_list()
    standard = await StandardDeduct.find_all().to_list()
    cap = await CapitalGains.find_all().to_list()
    rmd = await RMDTable.find_all().to_list()
    
    scraper = Scraper()
    
    if not fed:
        ret = scraper.scrape_federal_income()
        # print(ret['single'])
        single = []
        for bracket in ret['single']:
            b = Bracket(
                min_income=bracket['min_income'], 
                max_income=bracket['max_income'], 
                rate=bracket['rate']
            )
            print(b)
            single.append(b)
        married = []
        for bracket in ret['married']:
            b = Bracket(
                min_income=bracket['min_income'],
                max_income=bracket['max_income'],
                rate=bracket['rate']
            )
            married.append(b)
        fed_entry = FederalTax(
            year_from=2025,
            single_bracket=single,
            married_bracket=married
        )
        await fed_entry.insert()
        print("FULFILLED: federal tax entry done")
    else:
        print("SKIPPED: federal tax entry already done")
    
    states = ['NY','CT','NJ']
    complete = []
    existing_states = [tax.state for tax in state_res if tax.user_id == "all"]

    for state in states:
        if state not in existing_states:
            ret = scraper.scrape_state_income(state)
            base_add = ret['base_add']
            single_deduct = ret['single']['standard_deductions']
            married_deduct = ret['married']['standard_deductions']
            single = []
            for bracket in ret['single']['brackets']:
                b = StateBracket(
                    min_income=bracket['min_income'],
                    max_income=bracket['max_income'],
                    base=bracket['base'],
                    rate=bracket['rate']
                )
                single.append(b)
            married = []
            for bracket in ret['married']['brackets']:
                b = StateBracket(
                    min_income=bracket['min_income'],
                    max_income=bracket['max_income'],
                    base=bracket['base'],
                    rate=bracket['rate']
                )
                married.append(b)
            state_entry = StateTax(
                year_from=2025,
                state=state,
                base_add=base_add,
                single_deduct=single_deduct,
                married_deduct=married_deduct,
                single_bracket=single,
                married_bracket=married
            )
            await state_entry.insert()
            complete.append(state)

    if complete:
        print(f"FULFILLED: {', '.join(complete)} entry done")
    else:
        print("SKIPPED: NY, CT, NJ entry already done")
    
    if not standard:
        ret = scraper.scrape_standard_deductions()
        std_entry = StandardDeduct(
            year_from=2025,
            single_deduct=ret['single'],
            married_deduct=ret['married']
        )
        await std_entry.insert()
        print("FULFILLED: standard deduction entry done")
    else:
        print("SKIPPED: standard deduction entry already done")
    
    
    if not cap:
        ret = scraper.scrape_capital_gains()
        print("CAPITAL", ret)
        single = []
        for bracket in ret['single']:
            b = Bracket(
                min_income=bracket['min_income'], 
                max_income=bracket['max_income'], 
                rate=bracket['rate']
            )
            print(b)
            single.append(b)
        married = []
        for bracket in ret['married']:
            b = Bracket(
                min_income=bracket['min_income'],
                max_income=bracket['max_income'],
                rate=bracket['rate']
            )
            married.append(b)
        cap_entry = CapitalGains(
            year_from=2025,
            single_bracket=single,
            married_bracket=married
        )
        await cap_entry.insert()
        print("FULFILLED: capital gains entry done")            
    else:
        print("SKIPPED, capital gains entry already done")
        
    if not rmd:
        ret = scraper.scrape_rmd_tables()
        distribs = []
        for dist in ret:
            distribs.append(Distribution(age=dist['age'], distribution_period=dist['distribution_period']))
        rmd_entry = RMDTable(
            year_from=2025,
            table=distribs
        )
        await rmd_entry.insert()
        print("FULFILLED: rmd table entry done")
    else:
        print("SKIPPED: rmd table entry already done")