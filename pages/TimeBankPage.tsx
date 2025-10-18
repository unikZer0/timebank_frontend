
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Transaction } from '../types';
import { getUserTransactions } from '../services/apiService';
import { ArrowUpRightIcon, ArrowDownLeftIcon, ArrowsRightLeftIcon, CheckCircleIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';

const TransactionIcon: React.FC<{ transaction: Transaction; currentUserId: number }> = ({ transaction, currentUserId }) => {
    const baseClasses = 'w-6 h-6 p-2 rounded-full';
    
    // Determine if this is money coming in or going out for the current user
    const isIncoming = transaction.to_user_id === currentUserId;
    
    if (transaction.type === 'job_completion') {
        return <CheckCircleIcon className={`${baseClasses} bg-green-100 text-green-600`} />;
    } else if (transaction.type === 'transfer') {
        return isIncoming ? 
            <ArrowDownLeftIcon className={`${baseClasses} bg-green-100 text-green-600`} /> :
            <ArrowUpRightIcon className={`${baseClasses} bg-red-100 text-red-600`} />;
    }
    
    return <CurrencyDollarIcon className={`${baseClasses} bg-blue-100 text-blue-600`} />;
};

const getTransactionDescription = (transaction: Transaction, currentUserId: number): string => {
    const isIncoming = transaction.to_user_id === currentUserId;
    
    if (transaction.type === 'job_completion') {
        return 'Job completion reward';
    } else if (transaction.type === 'transfer') {
        if (isIncoming) {
            const fromName = transaction.from_first_name && transaction.from_last_name 
                ? `${transaction.from_first_name} ${transaction.from_last_name}`
                : 'Unknown User';
            return `Received from ${fromName}`;
        } else {
            const toName = transaction.to_first_name && transaction.to_last_name 
                ? `${transaction.to_first_name} ${transaction.to_last_name}`
                : 'Unknown User';
            return `Sent to ${toName}`;
        }
    }
    
    return 'Transaction';
};

const TimeBankPage: React.FC = () => {
  const { currentUser, walletBalance, isLoadingBalance } = useUser();
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [visibleTransactions, setVisibleTransactions] = useState(5);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoadingTransactions(true);
        const response = await getUserTransactions(20, 0); // Get first 20 transactions
        
        if (response.success && response.transactions) {
          setTransactions(response.transactions);
        } else {
          showToast('Failed to load transactions', 'error');
        }
      } catch (error: any) {
        console.error('Error fetching transactions:', error);
        showToast('Failed to load transactions', 'error');
      } finally {
        setIsLoadingTransactions(false);
      }
    };

    fetchTransactions();
  }, [currentUser, showToast]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

    if (isNearBottom && visibleTransactions < transactions.length) {
      setVisibleTransactions(prev => Math.min(prev + 5, transactions.length));
    }
  }, [visibleTransactions, transactions.length]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const displayedTransactions = transactions.slice(0, visibleTransactions);
  
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="font-prompt space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary-text font-prompt">My Time Bank</h1>
        <p className="text-secondary-text">View your credit balance and transaction history.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1 bg-surface border border-border-color rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center">
            <p className="text-secondary-text font-medium">Your Current Balance</p>
            {isLoadingBalance ? (
              <div className="flex items-center justify-center my-3">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent"></div>
              </div>
            ) : (
              <p className="text-6xl font-bold text-accent my-3">{walletBalance !== null ? walletBalance : currentUser.timeCredit}</p>
            )}
            <p className="text-sm font-semibold text-secondary-text bg-accent-light px-3 py-1 rounded-full inline-block">Time Credits</p>
            <Link to="/timebank/transfer" className="mt-6 w-full flex items-center justify-center px-4 py-3 bg-accent text-white font-bold rounded-lg hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20">
                <ArrowsRightLeftIcon className="w-5 h-5 mr-2" />
                Transfer Credits
            </Link>
        </div>
        
        {/* Transaction History */}
        <div className="lg:col-span-2 bg-surface border border-border-color rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-primary-text mb-4">Recent Transactions</h2>
            <div ref={scrollContainerRef} className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {isLoadingTransactions ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                        <p className="text-secondary-text mt-2">Loading transactions...</p>
                    </div>
                ) : transactions.length > 0 ? displayedTransactions.map(tx => {
                    const isIncoming = tx.to_user_id === currentUser.id;
                    return (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                            <div className="flex items-center space-x-4">
                                <TransactionIcon transaction={tx} currentUserId={currentUser.id} />
                                <div>
                                    <p className="font-semibold text-primary-text">{getTransactionDescription(tx, currentUser.id)}</p>
                                    <p className="text-sm text-secondary-text">{new Date(tx.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <p className={`font-bold text-lg ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>
                                {isIncoming ? '+' : '-'}{tx.amount}
                            </p>
                        </div>
                    );
                }) : (
                    <p className="text-secondary-text text-center py-4">No transactions yet.</p>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default TimeBankPage;
