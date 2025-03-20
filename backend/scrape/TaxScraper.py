import requests
from bs4 import BeautifulSoup

class TaxScraper:
    '''
        Returns:
            [single, married] 
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

    def scrape_state_income(self):
        pass


    '''
        Returns:
            [single: Float, married: Float]
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
        
        return standard_deductions


test = TaxScraper()
print(test.scrape_standard_deductions())
# print(test.scrape_federal_income())