# lifetime_financial_planner

# To run backend:

From root directory:
```PYTHONPATH=backend python3 -m app.main```

From backend directory:
```python3 -m app.main```

This is because we need python to recognize backend as the root directory for the FastAPI application so it understands it's context properly.

# python3 -m app.main vs python3 app/main.py

python3 -m app.main treats app as the module, so both relative and absolute imports work

python3 app/main.py treats main.py as a script, so it's not recognized as part of app module so relative imports will fail, same as absolute imports, it uses main.py as the root for imports and has no context.