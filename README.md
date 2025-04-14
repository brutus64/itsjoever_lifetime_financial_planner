# lifetime_financial_planner

# To run frontend:

```
cd frontend
npm install
npm run dev
```

# To run backend:

create .env file in backend folder with the following as the data: 
```
MONGODB_URL=mongodb+srv://dannywang723:lfp123haha@lfp.oyz0k.mongodb.net/?retryWrites=true&w=majority&appName=lfp
FEDERAL_TAX_URL=https://www.irs.gov/filing/federal-income-tax-rates-and-brackets
CAPITAL_GAINS_TAX_URL=https://www.irs.gov/taxtopics/tc409
STANDARD_DEDUCTION_URL=https://www.irs.gov/publications/p17
RMD_TABLE_URL=https://www.irs.gov/publications/p590b
```


Create virtual environment inside backend folder:

MAC:
```
python3 -m venv .venv
pip install -r requirements.txt
```

Windows:
```
python -m venv .venv
pip install -r requirements.txt
```

From root directory:
```PYTHONPATH=backend python3 -m app.main```

From backend directory:
```python3 -m app.main```

To run pytest:
```
Go to backend directory
cd backend
PYTHONPATH=. pytest -s tests/test_routes.py
PYTHONPATH=. pytest --cov=app tests/
```

pytest cov is for looking at code coverage

This is because we need python to recognize backend as the root directory for the FastAPI application so it understands it's context properly.

# python3 -m app.main vs python3 app/main.py

python3 -m app.main treats app as the module, so both relative and absolute imports work

python3 app/main.py treats main.py as a script, so it's not recognized as part of app module so relative imports will fail, same as absolute imports, it uses main.py as the root for imports and has no context.
