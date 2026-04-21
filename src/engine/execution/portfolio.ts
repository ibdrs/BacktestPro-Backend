import { Portfolio } from '../../types/portfolio';

/** Create a brand-new portfolio with the given starting cash. */
export function createPortfolio(initialCash: number): Portfolio {
  return {
    cash: initialCash,
    positionQty: 0,
    entryPrice: 0,
    realizedPnl: 0,
  };
}

/**
 * Open a long position.
 * Spends `cashToSpend` at `price`, returning the updated portfolio.
 * The caller decides how much cash to commit (positionSize * available cash).
 */
export function openPosition(
  portfolio: Portfolio,
  price: number,
  cashToSpend: number
): Portfolio {
  const quantity = cashToSpend / price;
  return {
    ...portfolio,
    cash: portfolio.cash - cashToSpend,
    positionQty: quantity,
    entryPrice: price,
  };
}

/**
 * Close the entire open position at `price`.
 * Returns the updated portfolio and the realized PnL for this specific trade.
 */
export function closePosition(
  portfolio: Portfolio,
  price: number
): { updatedPortfolio: Portfolio; tradePnl: number } {
  const saleValue = portfolio.positionQty * price;
  const costBasis  = portfolio.positionQty * portfolio.entryPrice;
  const tradePnl   = saleValue - costBasis;

  const updatedPortfolio: Portfolio = {
    cash: portfolio.cash + saleValue,
    positionQty: 0,
    entryPrice: 0,
    realizedPnl: portfolio.realizedPnl + tradePnl,
  };

  return { updatedPortfolio, tradePnl };
}

/**
 * Calculate the current total portfolio value.
 * = cash on hand + market value of the open position (if any)
 */
export function getPortfolioValue(portfolio: Portfolio, currentPrice: number): number {
  return portfolio.cash + portfolio.positionQty * currentPrice;
}
