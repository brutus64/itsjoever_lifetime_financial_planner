import requests
import yaml
from bs4 import BeautifulSoup

# IMPORTANT: 
# Ranges for min_income and max_income goes as:
#           min_income <= x < max_income, given income x
# AKA: on taxable income from {min_income} UP TO {max_income}
# - Applies to federal, state, and capital gains
class TaxScraper:
    '''
        RETURNS:
            { 
                single: [{min_income: Float, max_income: Float, rate: Float}], 
                married: [{min_income: Float, max_income: Float, rate: Float}]
            } 

        Note: A value of -1.0 is used to represent "And above" for the last bracket's  maxIncome 
    '''
    def scrape_federal_income(self):
        url = 'https://www.irs.gov/filing/federal-income-tax-rates-and-brackets'
        response = requests.get(url)

        soup = BeautifulSoup(response.content, 'lxml')
        tax_table = soup.find_all('table', class_='table complex-table table-striped table-bordered table-responsive')

        def parse_single_married(tax_table):
            info = []
            rows = tax_table.find_all('tr')
            
            for row in rows:
                cells = row.find_all('td')
                
                if len(cells) > 1:
                    tax_rate = float(cells[0].text.strip()[:-1])
                    tax_bracket_start = float(cells[1].text.strip().replace('$', '').replace(',', ''))
                    tax_bracket_end = -1.0 if cells[2].text.strip() == 'And up' else float(cells[2].text.strip().replace('$', '').replace(',', ''))+1 
                    info.append({
                        'min_income': tax_bracket_start, 
                        'max_income': tax_bracket_end, 
                        'rate': tax_rate
                        })
            return info

        return {'single': parse_single_married(tax_table[0]), 'married': parse_single_married(tax_table[1])}

    '''
        PARAMETERS:
            state: String (eg: 'NY', 'NJ', 'CT')

        RETURNS:
            None IF state doesn't exist in state_tax.yaml OR the dictionary: 
            {
                base_add: Boolean (whether to add or subtract {base} value after calculating rate),
                single: 
                {
                    brackets: [{min_income: Float, max_income: Float, base: Float, rate: Float}],
                    standard_deductions: Float
                },
                married:
                {
                    brackets: [{min_income: Float, max_income: Float, base: Float, rate: Float}],
                    standard_deductions: Float
                }
            }

    '''
    def scrape_state_income(self, state):
        with open('./state_tax.yaml', 'r') as file:
            data = yaml.safe_load(file)
        
        state_tax_info = {}
        if state not in data['states']:
            return None
        
        single, married = {}, {}
        state_data = data['states'][state]
        state_tax_info['base_add'] = state_data['base_add']

        single['standard_deductions'] = state_data['single']['standard_deductions']
        married['standard_deductions'] = state_data['married']['standard_deductions'] 

        single_brackets, married_brackets = state_data['single']['brackets'], state_data['married']['brackets']
        def scrape_helper(brackets): 
            res = []
            for bracket in brackets:
                res.append({
                    'min_income': bracket.get('min_income'), 
                    'max_income': bracket.get('max_income'), 
                    'base': bracket.get('base'), 
                    'rate': bracket.get('rate')})
            return res

        single['brackets'], married['brackets'] = scrape_helper(single_brackets), scrape_helper(married_brackets)
        state_tax_info['single'], state_tax_info['married'] = single, married 
        return state_tax_info
    
    '''
        RETURNS:
            { 
                'single': [{min_income: Float, max_income: Float, rate: Float}], 
                'married': [{min_income: Float, max_income: Float, rate: Float}]
            } 

        Note: A value of -1.0 is used to represent "And above" for the last bracket's  maxIncome 
    '''
    def scrape_capital_gains(self):
        url = 'https://www.irs.gov/taxtopics/tc409'
        response = requests.get(url)

        soup = BeautifulSoup(response.content, 'lxml')
        p_tags = soup.find_all('p')

        # Find percentages
        percentages = []
        for p_tag in p_tags:
            if 'capital gains rate of' in p_tag.text:
                text = p_tag.text
                percent_string = text.split("capital gains rate of")[1]
                percent_index = percent_string.find('%')
                percent = float(percent_string[:percent_index].strip())
                percentages.append(percent)

        # Extract min/max value given a string
        def find_capital_gains(text):
            space_index = text.find(' ')
            val = float(text[:space_index].replace('$', '').replace(',', ''))
            return val

        single_range, married_range = [], []
        # Find ranges and store in {single_range} and {married_range}
        def scrape_helper(ul_tag, zero_or_fifteen):
            li_tags = ul_tag.find_all('li')
            single_tax_rate = li_tags[0].text
            if zero_or_fifteen == 0:
                married_tax_rate = li_tags[1].text
                single_range.append([0, find_capital_gains(single_tax_rate)+0.01])
                married_range.append([0, find_capital_gains(married_tax_rate)+0.01])
            elif zero_or_fifteen == 15:
                married_tax_rate = li_tags[2].text
                split_single = single_tax_rate.split("$")
                split_married = married_tax_rate.split("$")

                single_range.append([find_capital_gains(split_single[1])+0.01, find_capital_gains(split_single[2])+0.01])
                married_range.append([find_capital_gains(split_married[1])+0.01, find_capital_gains(split_married[2])+0.01])

                single_range.append([find_capital_gains(split_single[2])+0.01, -1])
                married_range.append([find_capital_gains(split_married[2])+0.01, -1])

        ul_container = soup.find_all('div', class_='field field--name-body field--type-text-with-summary field--label-hidden field--item')
        ul_tags = ul_container[1].find_all('ul')
        scrape_helper(ul_tags[0], 0)
        scrape_helper(ul_tags[1], 15)

        labels = ['min_income', 'max_income', 'rate']
        single_list, married_list = list(zip(*zip(*single_range), percentages)), list(zip(*zip(*married_range), percentages))

        single, married = [], []
        for i in range(len(single_list)):
            single.append({
                labels[0]: single_list[i][0],
                labels[1]: single_list[i][1],
                labels[2]: single_list[i][2] 
            })
            married.append({
                labels[0]: married_list[i][0],
                labels[1]: married_list[i][1],
                labels[2]: married_list[i][2] 
            })

        return {'single': single, 'married': married}

    '''
        RETURNS:
            {
                'single': Float, 
                'married': Float
            }
    '''
    def scrape_standard_deductions(self):
        url = 'https://www.irs.gov/publications/p17'
        response = requests.get(url)

        soup = BeautifulSoup(response.content, 'lxml')
        div_table = soup.find_all('div', class_='table-contents')[8] #8th table-contents table
        std_deduct_table = div_table.find_all('table', class_='table table-condensed')

        table = std_deduct_table[0]
        rows = table.find_all('tr') 
        '''
        0 IF your filing status is ... | THEN your standard deduction is...
        1 Single or Married filing separately | $14,600
        2 Married filing jointly or Qualifying... | 29,200
        3 Head of household | 21,900
        4 Don't use this chart if you were...
        '''
        standard_deductions = []
        for row in rows[1:3]: # Only want single and married
            cells = row.find_all('td') 
            amount = float(cells[1].text.strip().replace(',', '').replace('$', ''))
            standard_deductions.append(amount)
        
        return {'single': standard_deductions[0], 'married': standard_deductions[1]}


test = TaxScraper()
# print(test.scrape_federal_income())
# print(test.scrape_state_income('NY'))
# print(test.scrape_capital_gains())
print(test.scrape_standard_deductions())