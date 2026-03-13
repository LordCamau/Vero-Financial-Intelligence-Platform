from __future__ import annotations

from collections import defaultdict
from datetime import datetime, date, timedelta
from statistics import mean, pstdev
from typing import List, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Vero Analytics Service", version="0.1.0")

CATEGORY_RULES = {
    "uber": "Transport",
    "lyft": "Transport",
    "netflix": "Subscriptions",
    "spotify": "Subscriptions",
    "hulu": "Subscriptions",
    "amazon": "Shopping",
    "starbucks": "Food",
    "whole foods": "Groceries",
    "shell": "Fuel",
    "airbnb": "Travel",
    "delta": "Travel",
    "walmart": "Shopping",
    "apple": "Technology",
    "google": "Technology"
}


class CategorizeRequest(BaseModel):
    merchant: str
    amount: float
    type: str


class CategorizeResponse(BaseModel):
    category: str


class Transaction(BaseModel):
    id: Optional[str] = None
    account_id: Optional[str] = None
    amount: float
    currency: Optional[str] = None
    merchant: str
    category: Optional[str] = None
    type: str
    timestamp: datetime
    notes: Optional[str] = None


class TransactionsPayload(BaseModel):
    transactions: List[Transaction]


class CashflowRequest(TransactionsPayload):
    current_balance: float = Field(..., alias="current_balance")


class SubscriptionInsight(BaseModel):
    merchant: str
    amount: float
    frequency: str
    next_expected_charge: date


class AnomalyInsight(BaseModel):
    transaction_id: Optional[str]
    merchant: str
    amount: float
    reason: str


class HealthScore(BaseModel):
    score: int
    rating: str


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.post("/categorize", response_model=CategorizeResponse)
async def categorize(req: CategorizeRequest):
    merchant = req.merchant.lower()
    for key, category in CATEGORY_RULES.items():
        if key in merchant:
            return {"category": category}
    return {"category": "Other"}


@app.post("/insights/subscriptions", response_model=List[SubscriptionInsight])
async def detect_subscriptions(payload: TransactionsPayload):
    groups: dict[tuple[str, float], List[Transaction]] = defaultdict(list)
    for txn in payload.transactions:
        if txn.type != "debit":
            continue
        key = (txn.merchant.lower(), round(txn.amount, 2))
        groups[key].append(txn)

    results: List[SubscriptionInsight] = []
    for (merchant, amount), items in groups.items():
        if len(items) < 3:
            continue
        items_sorted = sorted(items, key=lambda x: x.timestamp)
        diffs = []
        for i in range(1, len(items_sorted)):
            delta = items_sorted[i].timestamp.date() - items_sorted[i - 1].timestamp.date()
            diffs.append(delta.days)

        if not diffs:
            continue

        avg_diff = mean(diffs)
        frequency = None
        if 26 <= avg_diff <= 35:
            frequency = "monthly"
            next_charge = items_sorted[-1].timestamp.date() + timedelta(days=30)
        elif 6 <= avg_diff <= 8:
            frequency = "weekly"
            next_charge = items_sorted[-1].timestamp.date() + timedelta(days=7)
        else:
            continue

        results.append(
            SubscriptionInsight(
                merchant=merchant.title(),
                amount=amount,
                frequency=frequency,
                next_expected_charge=next_charge
            )
        )

    return results


@app.post("/insights/anomalies", response_model=List[AnomalyInsight])
async def detect_anomalies(payload: TransactionsPayload):
    debits = [txn for txn in payload.transactions if txn.type == "debit"]
    if not debits:
        return []

    amounts = [txn.amount for txn in debits]
    avg = mean(amounts)
    deviation = pstdev(amounts) or 0
    category_counts: dict[str, int] = defaultdict(int)
    for txn in debits:
        category_counts[(txn.category or "Other").lower()] += 1

    results: List[AnomalyInsight] = []
    threshold = avg + (2 * deviation)
    for txn in debits:
        reasons = []
        if txn.amount > threshold:
            reasons.append("amount_spike")
        category = (txn.category or "Other").lower()
        if category_counts[category] <= 1:
            reasons.append("rare_category")
        if txn.amount > avg * 3:
            reasons.append("large_purchase")

        if reasons:
            results.append(
                AnomalyInsight(
                    transaction_id=txn.id,
                    merchant=txn.merchant,
                    amount=txn.amount,
                    reason=", ".join(sorted(set(reasons)))
                )
            )

    return results


@app.post("/insights/cashflow")
async def predict_cashflow(payload: CashflowRequest):
    transactions = payload.transactions
    current_balance = payload.current_balance

    now = datetime.utcnow()
    cutoff = now - timedelta(days=180)

    monthly_income: dict[str, float] = defaultdict(float)
    monthly_expenses: dict[str, float] = defaultdict(float)

    for txn in transactions:
        if txn.timestamp < cutoff:
            continue
        key = txn.timestamp.strftime("%Y-%m")
        if txn.type == "credit":
            monthly_income[key] += txn.amount
        else:
            monthly_expenses[key] += txn.amount

    income_values = list(monthly_income.values()) or [0.0]
    expense_values = list(monthly_expenses.values()) or [0.0]

    predicted_income = round(mean(income_values), 2)
    predicted_expenses = round(mean(expense_values), 2)
    predicted_balance = round(current_balance + predicted_income - predicted_expenses, 2)

    return {
        "predicted_income": predicted_income,
        "predicted_expenses": predicted_expenses,
        "predicted_balance": predicted_balance
    }


@app.post("/insights/health", response_model=HealthScore)
async def health_score(payload: TransactionsPayload):
    transactions = payload.transactions
    now = datetime.utcnow()
    cutoff = now - timedelta(days=90)

    recent = [txn for txn in transactions if txn.timestamp >= cutoff]
    income = sum(txn.amount for txn in recent if txn.type == "credit")
    spending = sum(txn.amount for txn in recent if txn.type == "debit")

    savings_ratio = 0
    if income > 0:
        savings_ratio = max(0, (income - spending) / income)

    monthly_spending: dict[str, float] = defaultdict(float)
    for txn in recent:
        if txn.type == "debit":
            key = txn.timestamp.strftime("%Y-%m")
            monthly_spending[key] += txn.amount

    spending_values = list(monthly_spending.values()) or [0.0]
    spending_mean = mean(spending_values) if spending_values else 0
    volatility = (pstdev(spending_values) / spending_mean) if spending_mean > 0 else 0

    subscription_spend = sum(
        txn.amount for txn in recent if (txn.category or "").lower() == "subscriptions"
    )
    subscription_burden = (subscription_spend / income) if income > 0 else 0

    score = 100
    score -= max(0, (0.2 - savings_ratio) * 100)
    if spending > income and income > 0:
        score -= min(25, ((spending - income) / income) * 100)
    score -= min(20, volatility * 50)
    score -= min(20, subscription_burden * 100)

    score = max(0, min(100, round(score)))
    if score >= 80:
        rating = "Good"
    elif score >= 60:
        rating = "Fair"
    else:
        rating = "Needs Attention"

    return HealthScore(score=score, rating=rating)
