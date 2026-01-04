/**
 * Lendora AI - Global State Management Context
 * Manages loans and transactions with localStorage persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// ============ Interfaces ============

export interface Loan {
    id: string;
    asset: string;
    amount: number;
    type: 'borrow' | 'lend';
    apy: number;
    status: 'active' | 'completed' | 'defaulted' | 'pending';
    termMonths: number;
    startDate: string;
    endDate?: string;
    counterpartyAddress?: string;
    walletAddress: string;
}

export interface Transaction {
    id: string;
    type: 'borrow' | 'lend' | 'repay' | 'withdraw' | 'interest_payment';
    amount: number;
    asset: string;
    stablecoin: string;
    status: 'completed' | 'pending' | 'failed';
    timestamp: string;
    txHash?: string;
    description: string;
    loanId?: string;
}

interface LendoraContextType {
    // Loans state
    loans: Loan[];
    addLoan: (loan: Omit<Loan, 'id' | 'startDate'>) => Loan;
    updateLoanStatus: (loanId: string, status: Loan['status']) => void;
    
    // Transactions state
    transactions: Transaction[];
    addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => Transaction;
    
    // Computed values
    totalBorrowed: number;
    totalLent: number;
    activeBorrowedLoans: Loan[];
    activeLentLoans: Loan[];
}

// ============ Storage Keys ============

const LOANS_STORAGE_KEY = 'lendora_loans';
const TRANSACTIONS_STORAGE_KEY = 'lendora_transactions';

// ============ Utility Functions ============

const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored) as T;
        }
    } catch (error) {
        console.error(`Failed to load ${key} from localStorage:`, error);
    }
    return defaultValue;
};

const saveToStorage = <T,>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Failed to save ${key} to localStorage:`, error);
    }
};

// ============ Context ============

const LendoraContext = createContext<LendoraContextType | undefined>(undefined);

// ============ Provider ============

interface LendoraProviderProps {
    children: ReactNode;
}

export function LendoraProvider({ children }: LendoraProviderProps) {
    // Initialize state from localStorage
    const [loans, setLoans] = useState<Loan[]>(() => 
        loadFromStorage<Loan[]>(LOANS_STORAGE_KEY, [])
    );
    
    const [transactions, setTransactions] = useState<Transaction[]>(() => 
        loadFromStorage<Transaction[]>(TRANSACTIONS_STORAGE_KEY, [])
    );

    // Persist loans to localStorage whenever they change
    useEffect(() => {
        saveToStorage(LOANS_STORAGE_KEY, loans);
    }, [loans]);

    // Persist transactions to localStorage whenever they change
    useEffect(() => {
        saveToStorage(TRANSACTIONS_STORAGE_KEY, transactions);
    }, [transactions]);

    // Add a new loan
    const addLoan = useCallback((loanData: Omit<Loan, 'id' | 'startDate'>): Loan => {
        const newLoan: Loan = {
            ...loanData,
            id: generateId(),
            startDate: new Date().toISOString(),
        };

        setLoans(prevLoans => [...prevLoans, newLoan]);

        // Also create a corresponding transaction
        const transactionType = loanData.type === 'borrow' ? 'borrow' : 'lend';
        const description = loanData.type === 'borrow'
            ? `Borrowed ${loanData.amount.toLocaleString()} ${loanData.asset}`
            : `Lent ${loanData.amount.toLocaleString()} ${loanData.asset}`;

        addTransaction({
            type: transactionType,
            amount: loanData.amount,
            asset: loanData.asset,
            stablecoin: loanData.asset,
            status: 'completed',
            description,
            loanId: newLoan.id,
        });

        return newLoan;
    }, []);

    // Update loan status
    const updateLoanStatus = useCallback((loanId: string, status: Loan['status']) => {
        setLoans(prevLoans =>
            prevLoans.map(loan =>
                loan.id === loanId
                    ? { ...loan, status, endDate: status === 'completed' ? new Date().toISOString() : loan.endDate }
                    : loan
            )
        );
    }, []);

    // Add a new transaction
    const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'timestamp'>): Transaction => {
        const newTransaction: Transaction = {
            ...transactionData,
            id: generateId(),
            timestamp: new Date().toISOString(),
            txHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock tx hash
        };

        setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);

        return newTransaction;
    }, []);

    // Computed values
    const totalBorrowed = loans
        .filter(loan => loan.type === 'borrow' && loan.status === 'active')
        .reduce((sum, loan) => sum + loan.amount, 0);

    const totalLent = loans
        .filter(loan => loan.type === 'lend' && loan.status === 'active')
        .reduce((sum, loan) => sum + loan.amount, 0);

    const activeBorrowedLoans = loans.filter(
        loan => loan.type === 'borrow' && loan.status === 'active'
    );

    const activeLentLoans = loans.filter(
        loan => loan.type === 'lend' && loan.status === 'active'
    );

    const value: LendoraContextType = {
        loans,
        addLoan,
        updateLoanStatus,
        transactions,
        addTransaction,
        totalBorrowed,
        totalLent,
        activeBorrowedLoans,
        activeLentLoans,
    };

    return (
        <LendoraContext.Provider value={value}>
            {children}
        </LendoraContext.Provider>
    );
}

// ============ Hook ============

export function useLendora(): LendoraContextType {
    const context = useContext(LendoraContext);
    if (context === undefined) {
        throw new Error('useLendora must be used within a LendoraProvider');
    }
    return context;
}

export default LendoraContext;

