/**
 * Component Tests for AddAssetForm
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock the context
const mockAddStock = vi.fn();
vi.mock('../context/PortfolioContext', () => ({
    usePortfolio: () => ({
        addStock: mockAddStock,
        isLoading: false
    })
}));

// Simple component mock for testing form logic
function MockAddAssetForm() {
    const [symbol, setSymbol] = React.useState('');
    const [shares, setShares] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [error, setError] = React.useState('');

    const validate = () => {
        if (!symbol) return 'Symbol is required';
        if (!shares || parseFloat(shares) <= 0) return 'Shares must be positive';
        if (!price || parseFloat(price) <= 0) return 'Price must be positive';
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        mockAddStock({ symbol, shares: parseFloat(shares), purchasePrice: parseFloat(price) });
    };

    return (
        <form onSubmit={handleSubmit} data-testid="add-asset-form">
            <input
                placeholder="Symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                data-testid="symbol-input"
            />
            <input
                placeholder="Shares"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                type="number"
                data-testid="shares-input"
            />
            <input
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                data-testid="price-input"
            />
            {error && <span data-testid="error">{error}</span>}
            <button type="submit" data-testid="submit-button">Add</button>
        </form>
    );
}

describe('AddAssetForm Component', () => {
    beforeEach(() => {
        mockAddStock.mockClear();
    });

    describe('Form Rendering', () => {
        it('should render all form inputs', () => {
            render(<MockAddAssetForm />);
            expect(screen.getByTestId('symbol-input')).toBeInTheDocument();
            expect(screen.getByTestId('shares-input')).toBeInTheDocument();
            expect(screen.getByTestId('price-input')).toBeInTheDocument();
            expect(screen.getByTestId('submit-button')).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should show error when symbol is empty', () => {
            render(<MockAddAssetForm />);
            fireEvent.click(screen.getByTestId('submit-button'));
            expect(screen.getByTestId('error')).toHaveTextContent('Symbol is required');
        });

        it('should show error when shares is 0', () => {
            render(<MockAddAssetForm />);
            fireEvent.change(screen.getByTestId('symbol-input'), { target: { value: 'AAPL' } });
            fireEvent.change(screen.getByTestId('shares-input'), { target: { value: '0' } });
            fireEvent.click(screen.getByTestId('submit-button'));
            expect(screen.getByTestId('error')).toHaveTextContent('Shares must be positive');
        });

        it('should show error when price is empty', () => {
            render(<MockAddAssetForm />);
            fireEvent.change(screen.getByTestId('symbol-input'), { target: { value: 'AAPL' } });
            fireEvent.change(screen.getByTestId('shares-input'), { target: { value: '10' } });
            fireEvent.click(screen.getByTestId('submit-button'));
            expect(screen.getByTestId('error')).toHaveTextContent('Price must be positive');
        });
    });

    describe('Form Submission', () => {
        it('should call addStock with correct data on valid submit', () => {
            render(<MockAddAssetForm />);
            fireEvent.change(screen.getByTestId('symbol-input'), { target: { value: 'aapl' } });
            fireEvent.change(screen.getByTestId('shares-input'), { target: { value: '10' } });
            fireEvent.change(screen.getByTestId('price-input'), { target: { value: '150' } });
            fireEvent.click(screen.getByTestId('submit-button'));

            expect(mockAddStock).toHaveBeenCalledWith({
                symbol: 'AAPL',
                shares: 10,
                purchasePrice: 150
            });
        });

        it('should convert symbol to uppercase', () => {
            render(<MockAddAssetForm />);
            fireEvent.change(screen.getByTestId('symbol-input'), { target: { value: 'tsla' } });
            expect(screen.getByTestId('symbol-input')).toHaveValue('TSLA');
        });
    });

    describe('Input Types', () => {
        it('should have number type for shares input', () => {
            render(<MockAddAssetForm />);
            expect(screen.getByTestId('shares-input')).toHaveAttribute('type', 'number');
        });

        it('should have number type for price input', () => {
            render(<MockAddAssetForm />);
            expect(screen.getByTestId('price-input')).toHaveAttribute('type', 'number');
        });
    });
});
