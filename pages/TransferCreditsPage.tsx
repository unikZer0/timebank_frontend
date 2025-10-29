
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormField from '../components/FormField';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeftIcon, MagnifyingGlassIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { FamilyMember } from '../types';
import { transferCredits, getFamilyMembers, searchUserByIdCard } from '../services/apiService';

const TransferCreditsPage: React.FC = () => {
    const { currentUser, walletBalance, isLoadingBalance } = useUser();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [idCardSearch, setIdCardSearch] = useState('');
    const [searchedUsers, setSearchedUsers] = useState<FamilyMember[]>([]);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [isLoadingFamily, setIsLoadingFamily] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    
    const [recipient, setRecipient] = useState<FamilyMember | null>(null);
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);

    // Fetch family members on component mount
    useEffect(() => {
        const fetchFamilyMembers = async () => {
            try {
                setIsLoadingFamily(true);
                const response = await getFamilyMembers();
                
                if (response.success) {
                    setFamilyMembers(response.familyMembers || []);
                } else {
                    console.error('Failed to load family members:', response.message);
                    setFamilyMembers([]);
                }
            } catch (error: any) {
                console.error('Error fetching family members:', error);
                setFamilyMembers([]);
            } finally {
                setIsLoadingFamily(false);
            }
        };

        if (currentUser) {
            fetchFamilyMembers();
        }
    }, [currentUser]);

    if (!currentUser) {
        return <div>Loading...</div>;
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!idCardSearch.trim()) {
            setError('Please enter a search term.');
            setSearchedUsers([]);
            return;
        }
        
        try {
            setIsSearching(true);
            const response = await searchUserByIdCard(idCardSearch.trim());
            
            if (response.success && response.users) {
                setSearchedUsers(response.users);
            } else {
                setSearchedUsers([]);
                setError(response.message || 'No users found.');
            }
        } catch (error: any) {
            console.error('Error searching users:', error);
            setSearchedUsers([]);
            setError('Failed to search users.');
        } finally {
            setIsSearching(false);
        }
    };

    const selectRecipient = (user: FamilyMember) => {
        setRecipient(user);
        setSearchedUsers([]);
        setIdCardSearch('');
        setError('');
    };
    
    const clearRecipient = () => {
        setRecipient(null);
        setAmount('');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipient) return;
        
        const transferAmount = parseInt(amount);

        if (isNaN(transferAmount) || transferAmount <= 0) {
            showToast('Please enter a valid amount.', 'error');
            return;
        }
        
        const currentBalance = walletBalance !== null ? walletBalance : currentUser.timeCredit;
        if (transferAmount > currentBalance) {
            showToast("You don't have enough credits for this transfer.", 'error');
            return;
        }
        
        try {
            setIsTransferring(true);
            const response = await transferCredits(recipient.id, transferAmount);
            
            if (response.success) {
                showToast(`Successfully transferred ${amount} credits to ${recipient.first_name} ${recipient.last_name}!`, 'success');
                navigate('/timebank');
            } else {
                showToast(response.message || 'Transfer failed', 'error');
            }
        } catch (error: any) {
            console.error('Error transferring credits:', error);
            showToast('Transfer failed. Please try again.', 'error');
        } finally {
            setIsTransferring(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto font-prompt">
            <Link to="/timebank" className="inline-flex items-center text-secondary-text hover:text-accent mb-6 transition-colors">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                กลับไปที่ธนาคารเวลา
            </Link>
        <h1 className="text-3xl font-bold text-primary-text mb-2">โอนเครดิตเวลา</h1>
        <p className="text-secondary-text mb-6">คุณสามารถโอนเครดิตให้สมาชิกในครอบครัวเท่านั้น ค้นหาพวกเขาด้วยหมายเลขบัตรประชาชนเพื่อเพิ่ม</p>
            
            <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-md border border-border-color space-y-8">
                <div className="text-center bg-accent-light p-4 rounded-lg">
                    <p className="text-secondary-text font-medium">ยอดคงเหลือของคุณ</p>
                    {isLoadingBalance ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-accent">{walletBalance !== null ? walletBalance : currentUser.timeCredit} เครดิต</p>
                    )}
                </div>

                {!recipient ? (
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Family Members */}
                        <div>
                            <h2 className="text-xl font-semibold mb-3">สมาชิกในครอบครัว</h2>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {isLoadingFamily ? (
                                    <div className="text-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent mx-auto"></div>
                                        <p className="text-secondary-text text-sm mt-2">กำลังโหลดสมาชิกในครอบครัว...</p>
                                    </div>
                                ) : familyMembers.length > 0 ? familyMembers.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <img 
                                                src={member.avatar_url || `https://i.pravatar.cc/150?u=${member.email}`} 
                                                alt={`${member.first_name} ${member.last_name}`} 
                                                className="w-10 h-10 rounded-full" 
                                            />
                                            <span className="font-semibold text-primary-text">{member.first_name} {member.last_name}</span>
                                        </div>
                                        <button onClick={() => selectRecipient(member)} className="px-3 py-1 bg-accent text-white font-bold text-sm rounded-md hover:bg-accent-hover">Select</button>
                                    </div>
                                )) : <p className="text-secondary-text text-sm p-3 bg-background rounded-lg">No family members added yet.</p>}
                            </div>
                        </div>

                        {/* Search */}
                        <div>
                           <h2 className="text-xl font-semibold mb-3">ค้นหาด้วยชื่อหรือบัตรประชาชน</h2>
                           <form onSubmit={handleSearch} className="flex items-start space-x-2">
                                <div className="flex-grow">
                                    <input 
                                        type="text"
                                        placeholder="ค้นหาด้วยชื่อหรือหมายเลขบัตรประชาชน 13 หลัก"
                                        value={idCardSearch}
                                        onChange={(e) => setIdCardSearch(e.target.value)}
                                        className="w-full px-4 py-3 bg-background border border-border-color rounded-lg text-primary-text placeholder-secondary-text focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                                    />
                                     {error && <p className="text-red-500 text-sm mt-1.5">{error}</p>}
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isSearching}
                                    className="p-3 bg-accent text-white rounded-lg hover:bg-accent-hover disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {isSearching ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    ) : (
                                        <MagnifyingGlassIcon className="w-6 h-6"/>
                                    )}
                                </button>
                           </form>
                           
                           {/* Search Results */}
                           {searchedUsers.length > 0 && (
                                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                                    {searchedUsers.map(user => (
                                        <div key={user.id} className="p-3 bg-background rounded-lg flex items-center justify-between animate-subtle-enter">
                                            <div className="flex items-center space-x-3">
                                                <img 
                                                    src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.email}`} 
                                                    alt={`${user.first_name} ${user.last_name}`} 
                                                    className="w-10 h-10 rounded-full" 
                                                />
                                                <div>
                                                    <span className="font-semibold text-primary-text">{user.first_name} {user.last_name}</span>
                                                    <p className="text-xs text-secondary-text">ID: {user.national_id}</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => selectRecipient(user)} 
                                                className="px-3 py-1 bg-accent text-white font-bold text-sm rounded-md hover:bg-accent-hover"
                                            >
                                                เลือก
                                            </button>
                                        </div>
                                    ))}
                                </div>
                           )}
                        </div>
                    </div>
                ) : (
                    <div className="animate-subtle-enter">
                         <h2 className="text-xl font-semibold mb-3">Transfer Details</h2>
                         <div className="bg-background p-4 rounded-lg mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-secondary-text">ผู้รับ:</p>
                                <div className="flex items-center space-x-3 mt-1">
                                    <img 
                                        src={recipient.avatar_url || `https://i.pravatar.cc/150?u=${recipient.email}`} 
                                        alt={`${recipient.first_name} ${recipient.last_name}`} 
                                        className="w-10 h-10 rounded-full" 
                                    />
                                    <span className="font-bold text-lg text-primary-text">{recipient.first_name} {recipient.last_name}</span>
                                </div>
                            </div>
                            <button onClick={clearRecipient} className="text-sm font-semibold text-accent hover:underline">เปลี่ยน</button>
                         </div>
                         <form onSubmit={handleSubmit} className="space-y-4">
                             <FormField
                                label="จำนวนที่ต้องการโอน"
                                name="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                placeholder="เช่น 5"
                            />
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isTransferring}
                                    className="w-full py-3 bg-accent text-white font-bold text-lg rounded-md hover:bg-accent-hover transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed transform active:scale-95 shadow-lg shadow-accent/20"
                                >
                                    {isTransferring ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            กำลังโอน...
                                        </div>
                                    ) : (
                                        `ยืนยันและโอน ${amount && `${amount} เครดิต`}`
                                    )}
                                </button>
                            </div>
                         </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferCreditsPage;
