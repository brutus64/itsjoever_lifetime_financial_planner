import requests
from bs4 import BeautifulSoup

class TaxScraper:
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
                
                if len(cells) > 1:  # Ensure there are enough cells in the row
                    tax_rate = cells[0].text.strip()[:-1]  # Assuming tax rate is in the first column
                    tax_bracket_start = int(cells[1].text.strip()[1:].replace(',', ''))  # Assuming tax bracket is in the second column
                    tax_bracket_end = -1 if cells[2].text.strip() == 'And up' else int(cells[2].text.strip()[1:].replace(',', '')) 
                    info.append((tax_bracket_start, tax_bracket_end, tax_rate))
            return info

        return (parse_single_married(tax_table[0]), parse_single_married(tax_table[1]))