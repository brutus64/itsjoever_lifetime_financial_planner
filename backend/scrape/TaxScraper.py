import requests
from bs4 import BeautifulSoup

class TaxScraper:
    '''
        Returns:
            { 
                'single': single, 
                'married': married
            } 
                - where single/married are lists whose elements take the form:
            (minIncome: Float, maxIncome: Float, rate: Float)

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
                    tax_bracket_end = -1.0 if cells[2].text.strip() == 'And up' else float(cells[2].text.strip().replace('$', '').replace(',', '')) 
                    info.append((tax_bracket_start, tax_bracket_end, tax_rate))
            return info

        return [parse_single_married(tax_table[0]), parse_single_married(tax_table[1])]

    '''
        Returns:
            { 
                'single': single, 
                'married': married
            } 
                - where single/married are lists whose elements take the form:
            (minIncome: Float, maxIncome: Float, rate: Float)

        Note: A value of -1.0 is used to represent "And above" for the last bracket's  maxIncome 
    '''
    def scrape_capital_gains(self):
        url = 'https://www.irs.gov/taxtopics/tc409'
        response = requests.get(url)

        soup = BeautifulSoup(response.content, 'lxml')
        p_tags = soup.find_all('p')

        percentages = []
        for p_tag in p_tags:
            if 'capital gains rate of' in p_tag.text:
                text = p_tag.text
                percent_string = text.split("capital gains rate of")[1]
                percent_index = percent_string.find('%')
                percent = float(percent_string[:percent_index].strip())
                percentages.append(percent)

        def find_capital_gains(text):
            space_index = text.find(' ')
            val = float(text[:space_index].replace('$', '').replace(',', ''))
            return val

        single_range = []
        married_range = []
        def scrape_helper(ul_tag, zero_or_fifteen):
            li_tags = ul_tag.find_all('li')
            single_tax_rate = li_tags[0].text
            married_tax_rate = li_tags[1].text
            if zero_or_fifteen == 0:
                single_range.append([0, find_capital_gains(single_tax_rate)])
                married_range.append([0, find_capital_gains(married_tax_rate)])
            elif zero_or_fifteen == 15:
                split_single = single_tax_rate.split("$")
                split_married = married_tax_rate.split("$")

                single_range.append([find_capital_gains(split_single[1])+1, find_capital_gains(split_single[2])])
                married_range.append([find_capital_gains(split_married[1])+1, find_capital_gains(split_married[2])])


                single_range.append([find_capital_gains(split_single[2])+1, -1])
                married_range.append([find_capital_gains(split_married[2])+1, -1])

        ul_container = soup.find_all('div', class_='field field--name-body field--type-text-with-summary field--label-hidden field--item')
        ul_tags = ul_container[1].find_all('ul')
        scrape_helper(ul_tags[0], 0)
        scrape_helper(ul_tags[1], 15)

        single = list(zip(*zip(*single_range), percentages))
        married = list(zip(*zip(*married_range), percentages))

        return {'single': single, 'married': married}



    '''
        Returns:
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
# print(test.scrape_standard_deductions())
# print(test.scrape_federal_income())
print(test.scrape_capital_gains())