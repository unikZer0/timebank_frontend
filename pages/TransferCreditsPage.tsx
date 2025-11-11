// ✅ Full updated file with Thai relationship mapping and relationshipMap population
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import FormField from '../components/FormField';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { FamilyMember } from '../types';
import { transferCredits, getFamilyMembers, searchUserByIdCard, getPersonRelationsByNationalId } from '../services/apiService';
const TransferCreditsPage: React.FC = () => {
    const [relationshipMap, setRelationshipMap] = useState<Record<number, string>>({});

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

    const renderInitialAvatar = (firstName?: string, lastName?: string) => {
        const initial = (firstName && firstName[0]) || (lastName && lastName[0]) || '?';
        return (
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                {initial.toUpperCase()}
            </div>
        );
    };

    const referenceHousehold = familyMembers.length > 0 ? familyMembers[0].household : undefined;

    useEffect(() => {
        const fetchFamilyMembers = async () => {
            try {
                setIsLoadingFamily(true);
                const response = await getFamilyMembers();

                if (response.success) {
                    setFamilyMembers(response.familyMembers || []);
                } else {
                    setFamilyMembers([]);
                }
            } catch {
                setFamilyMembers([]);
            } finally {
                setIsLoadingFamily(false);
            }
        };

        if (currentUser) fetchFamilyMembers();
    }, [currentUser]);

    // ✅ Build Thai relationship labels
    useEffect(() => {
        if (!currentUser || familyMembers.length === 0) return;

        const map: Record<number, string> = {};

        familyMembers.forEach(member => {
            map[member.id] = getRelationBetween(currentUser, member);
        });

        setRelationshipMap(map);
    }, [currentUser, familyMembers]);

    if (!currentUser) return <div>Loading...</div>;

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const searchTerm = idCardSearch.trim();

        if (!searchTerm) {
            setError('กรุณากรอกคำค้นหา');
            setSearchedUsers([]);
            return;
        }

        if (searchTerm.length < 2) {
            setError('กรุณากรอกคำค้นหาอย่างน้อย 2 ตัวอักษร');
            setSearchedUsers([]);
            return;
        }

        try {
            setIsSearching(true);
            const response = await searchUserByIdCard(searchTerm);

            if (response.success && response.users) {
                const familyMemberIds = new Set(familyMembers.map(m => m.id));
                const filtered = response.users.filter((u: FamilyMember) => familyMemberIds.has(u.id));

                if (filtered.length > 0) {
                    setSearchedUsers(filtered);
                    setError('');
                } else {
                    setSearchedUsers([]);
                    setError('ไม่พบสมาชิกในครอบครัวที่ตรงกับการค้นหา');
                }
            } else {
                setSearchedUsers([]);
                setError('ไม่พบสมาชิกในครอบครัวที่ตรงกับการค้นหา');
            }
        } catch {
            setSearchedUsers([]);
            setError('เกิดข้อผิดพลาดในการค้นหา กรุณาลองใหม่อีกครั้ง');
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!recipient) return;

        const transferAmount = parseInt(amount);
        const currentBalance = walletBalance ?? currentUser.timeCredit;

        if (isNaN(transferAmount) || transferAmount <= 0) {
            showToast('กรุณากรอกจำนวนที่ถูกต้อง', 'error');
            return;
        }

        if (transferAmount > currentBalance) {
            showToast('คุณมียอดคงเหลือไม่เพียงพอ', 'error');
            return;
        }

        try {
            setIsTransferring(true);
            const response = await transferCredits(recipient.id, transferAmount);

            if (response.success) {
                showToast(`โอน ${amount} เครดิตให้ ${recipient.first_name} ${recipient.last_name} สำเร็จ!`, 'success');
                navigate('/timebank');
            } else {
                showToast(response.message || 'โอนล้มเหลว', 'error');
            }
        } catch {
            showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
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
            <p className="text-secondary-text mb-6">คุณสามารถโอนเครดิตให้สมาชิกในครอบครัวเท่านั้น</p>

            <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-md border border-border-color space-y-8">
                <div className="text-center bg-accent-light p-4 rounded-lg">
                    <p className="text-secondary-text font-medium">ยอดคงเหลือของคุณ</p>
                    {isLoadingBalance ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                        </div>
                    ) : (
                        <p className="text-3xl font-bold text-accent">{walletBalance ?? currentUser.timeCredit} เครดิต</p>
                    )}
                </div>

                {!recipient ? (
                    <div className="grid md:grid-cols-2 gap-8">

                        <div>
                            <h2 className="text-xl font-semibold mb-3">สมาชิกในครอบครัว</h2>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {isLoadingFamily ? (
                                    <p className="text-center py-4 text-secondary-text">กำลังโหลด...</p>
                                ) : familyMembers.length > 0 ? familyMembers.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {renderInitialAvatar(member.first_name, member.last_name)}
                                            <div>
                                                <span className="font-semibold text-primary-text">{member.first_name} {member.last_name}</span>
                                                {member.household !== undefined && (
                                                    <div className="mt-0.5 text-xs text-secondary-text">ครัวเรือน {member.household}</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-xs text-accent">ความสัมพันธ์: {relationshipMap[member.id] || '-'}</div>
                                        <button onClick={() => selectRecipient(member)} className="px-3 py-1 bg-accent text-white rounded-md">เลือก</button>
                                    </div>
                                )) : (
                                    <p className="text-secondary-text text-sm p-3 bg-background rounded-lg">ยังไม่มีสมาชิกในครอบครัว</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-3">ค้นหาด้วยชื่อหรือบัตรประชาชน</h2>
                            <form onSubmit={handleSearch} className="flex items-start space-x-2">
                                <input
                                    type="text"
                                    placeholder="ค้นหาด้วยชื่อหรือบัตรประชาชน"
                                    value={idCardSearch}
                                    onChange={e => setIdCardSearch(e.target.value)}
                                    className="w-full px-4 py-3 bg-background border border-border-color rounded-lg"
                                />
                                <button type="submit" disabled={isSearching} className="p-3 bg-accent text-white rounded-lg">
                                    {isSearching ? <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full"></div> : <MagnifyingGlassIcon className="w-6 h-6" />}
                                </button>
                            </form>

                            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

                            {searchedUsers.length > 0 && (
                                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                                    {searchedUsers.map(user => (
                                        <div key={user.id} className="p-3 bg-background rounded-lg flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                {renderInitialAvatar(user.first_name, user.last_name)}
                                                <div>
                                                    <span className="font-semibold text-primary-text">{user.first_name} {user.last_name}</span>
                                                    {user.household !== undefined && (
                                                        <div className="mt-0.5 text-xs text-secondary-text">ครัวเรือน {user.household}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs text-accent">ความสัมพันธ์: {relationshipMap[user.id] || '-'}</div>
                                            <button onClick={() => selectRecipient(user)} className="px-3 py-1 bg-accent text-white rounded-md">เลือก</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <h2 className="text-xl font-semibold mb-3">รายละเอียดการโอน</h2>
                        <div className="bg-background p-4 rounded-lg mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-secondary-text">ผู้รับ:</p>
                                <div className="flex items-center space-x-3 mt-1">
                                    {renderInitialAvatar(recipient.first_name, recipient.last_name)}
                                    <span className="font-bold text-lg text-primary-text">{recipient.first_name} {recipient.last_name}</span>
                                </div>
                            </div>
                            <button onClick={clearRecipient} className="text-sm text-accent underline">เปลี่ยน</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <FormField
                                label="จำนวนที่ต้องการโอน"
                                name="amount"
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                                placeholder="เช่น 5"
                            />

                            <button
                                type="submit"
                                disabled={isTransferring}
                                className="w-full py-3 bg-accent text-white font-bold text-lg rounded-md disabled:bg-gray-300"
                            >
                                {isTransferring ? 'กำลังโอน...' : `ยืนยันและโอน ${amount || ''}`}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferCreditsPage;
export function getRelationBetween(me: any, target: any): string {
  if (!me || !target) return "-";

  if (target.parents?.father_id === me.id) return "พ่อ";
  if (target.parents?.mother_id === me.id) return "แม่";

  if (me.parents?.father_id === target.id) return "ลูก";
  if (me.parents?.mother_id === target.id) return "ลูก";

  if (
    me.parents?.father_id &&
    me.parents.father_id === target.parents?.father_id &&
    me.parents?.mother_id &&
    me.parents.mother_id === target.parents?.mother_id &&
    me.id !== target.id
  ) return "พี่น้อง";

  if (target.relations?.uncles_aunts?.paternal?.includes(me.id)) return "ลุง/ป้า (ฝั่งพ่อ)";
  if (target.relations?.uncles_aunts?.maternal?.includes(me.id)) return "น้า/อา (ฝั่งแม่)";

  if (target.relations?.nephews_nieces?.includes(me.id)) return "หลาน";

  return "-";
}
