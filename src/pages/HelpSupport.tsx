import React, { useState } from 'react';
import { BookOpen, ChevronRight, Headphones, Mail, MessageSquareText, ShieldCheck, Ticket } from 'lucide-react';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Spacer from '../components/ui/Spacer';
import { useUIStore } from '../lib/stores/ui.store';

interface HelpSupportProps {
    role?: 'professor' | 'staff';
}

const HelpSupport: React.FC<HelpSupportProps> = ({ role = 'professor' }) => {
    const addToast = useUIStore((state) => state.addToast);
    const [openCard, setOpenCard] = useState<string | null>(null);
    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketMessage, setTicketMessage] = useState('');
    const helpCards = [
        {
            title: 'Submit a support ticket',
            description: role === 'staff'
                ? 'Need help with approval routing, payroll review, or faculty submissions? Send a ticket to the admin team.'
                : 'Need help with payroll, DTR, or an AR issue? Send a ticket to the admin team.',
            icon: Ticket,
        },
        {
            title: 'Contact HR / Admin',
            description: role === 'staff'
                ? 'Reach the office team for approval escalations, HR updates, and payroll processing questions.'
                : 'Reach the office team for payroll and documentation concerns.',
            icon: Mail,
        },
        {
            title: 'Quick FAQ',
            description: role === 'staff'
                ? 'Check the usual review flow for AR submissions, staff approval chains, and payroll calculation steps.'
                : 'Find the most common answers about due dates, approvals, and payroll processing.',
            icon: BookOpen,
        },
    ];

    const supportItems = [
        {
            title: 'AR submission deadline',
            answer: role === 'staff'
                ? 'Faculty members must submit their accomplishment reports before the end of the month. Notifications are sent during the final 7 days of the month.'
                : 'Accomplishment reports must be submitted before the end of the month. You will receive reminders during the final 7 days of the month.',
        },
        {
            title: 'Payroll calculation',
            answer: role === 'staff'
                ? 'Payroll is calculated after the report completes the required approval chain and is cleared for release.'
                : 'Payroll is calculated after the report is approved and the corresponding review chain completes.',
        },
        {
            title: 'Attendance and meeting proof',
            answer: 'Meeting proof and attendance records are stored in the system and can be reviewed from your dashboard.',
        },
    ];

    const selectedCard = helpCards.find((card) => card.title === openCard);
    const handleTicketSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        addToast({
            type: 'success',
            message: 'Support ticket submitted.',
            description: 'The admin team will follow up through your account.',
        });
        setTicketSubject('');
        setTicketMessage('');
        setOpenCard(null);
    };

    const closeHelpModal = () => {
        setOpenCard(null);
        setTicketSubject('');
        setTicketMessage('');
    };

    return (
        <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950">
            <main className="mx-auto max-w-6xl">
                <div className="grid gap-5 md:grid-cols-3">
                    {helpCards.map(({ title, description, icon: Icon }) => (
                        <Card className="sm:flex sm:flex-col sm:h-full" key={title} title={title} accentColor="#047857">
                            <div className="flex items-start gap-3">
                                <div className="flex w-12 h-12 aspect-square items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    <Icon size={22} />
                                </div>
                                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
                            </div>
                            <Spacer size={15} />
                            <button
                                type="button"
                                onClick={() => setOpenCard(title)}
                                className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-500 dark:text-emerald-400"
                            >
                                Open <ChevronRight size={14} />
                            </button>
                        </Card>
                    ))}
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card title="Frequently Asked Questions" accentColor="#047857">
                        <div className="space-y-4">
                            {supportItems.map((item) => (
                                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                                    <p className="text-base font-semibold text-slate-900 dark:text-white">{item.title}</p>
                                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.answer}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Contact Support" accentColor="#047857">
                        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                                <Headphones className="mt-0.5 text-emerald-600 dark:text-emerald-400" size={18} />
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">Hotline</p>
                                    <p>+63 912 345 6789</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                                <MessageSquareText className="mt-0.5 text-emerald-600 dark:text-emerald-400" size={18} />
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">Live chat</p>
                                    <p>Available Monday to Friday, 8:00 AM – 5:00 PM</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60">
                                <ShieldCheck className="mt-0.5 text-emerald-600 dark:text-emerald-400" size={18} />
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">Office support</p>
                                    <p>Human Resources and Admin Office</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <Modal
                    isOpen={Boolean(selectedCard)}
                    title={selectedCard?.title ?? 'Help and support'}
                    description={selectedCard?.description}
                    onClose={closeHelpModal}
                    size="md"
                >
                    {selectedCard?.title === 'Submit a support ticket' && (
                        <form className="space-y-4" onSubmit={handleTicketSubmit}>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Subject
                                <input
                                    required
                                    value={ticketSubject}
                                    onChange={(event) => setTicketSubject(event.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    placeholder="What do you need help with?"
                                />
                            </label>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Details
                                <textarea
                                    required
                                    value={ticketMessage}
                                    onChange={(event) => setTicketMessage(event.target.value)}
                                    className="mt-1.5 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                    placeholder="Describe the issue or question."
                                />
                            </label>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeHelpModal}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
                                >
                                    Submit ticket
                                </button>
                            </div>
                        </form>
                    )}

                    {selectedCard?.title === 'Contact HR / Admin' && (
                        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                            <p>Choose the support channel that best fits your request.</p>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                <p className="font-semibold text-slate-900 dark:text-white">HR / Admin Office</p>
                                <p className="mt-1">+63 912 345 6789</p>
                                <p>Monday to Friday, 8:00 AM - 5:00 PM</p>
                            </div>
                        </div>
                    )}

                    {selectedCard?.title === 'Quick FAQ' && (
                        <div className="space-y-3">
                            {supportItems.map((item) => (
                                <details key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                    <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">{item.title}</summary>
                                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.answer}</p>
                                </details>
                            ))}
                        </div>
                    )}
                </Modal>
            </main>
        </div>
    );
};

export default HelpSupport;
