
import React, { useState } from 'react';
import { Icon } from './Icon';
import { Language, User } from '../types';
import Loader from './Loader';

declare const Stripe: any; // Using Stripe.js from the script tag in index.html

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
  currentUser: User | null;
  onAddCredits: (amount: number, description: string) => void; // Kept for potential manual additions
  onOpenAchievements: () => void;
}

type SettingsTab = 'general' | 'billing';

// IMPORTANT: Replace these with the actual Price IDs from your Stripe Dashboard.
const creditPackages = [
    { name: 'Starter Paket', credits: 10000, price: '5,00 €', priceId: 'price_1STJtFGXmxuNg2UqDGRkJY6m' },
    { name: 'Profi Paket', credits: 50000, price: '20,00 €', priceId: 'price_1STJuZGXmxuNg2Uqs4w2Nobm' },
    { name: 'Meister Paket', credits: 150000, price: '50,00 €', priceId: 'price_1STJvBGXmxuNg2Uqy1JTsO22' },
];

const BACKEND_URL = 'http://localhost:4242';
// IMPORTANT: Replace with your actual Stripe publishable key from .env or your config
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51STJceGXmxuNg2UqgoemKqJ5fUWjObnPHbdWprOcX4hZwuSjpm8JmNssYWl1E0WLJD6u5vvErGhgKb1iOu1ER9WT00F9UE5Il2';


const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  currentUser,
  onAddCredits,
  onOpenAchievements
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const handlePurchase = async (priceId: string) => {
    if (!currentUser) {
        setError("Benutzer nicht gefunden. Bitte neu anmelden.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
        const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

        const response = await fetch(`${BACKEND_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ priceId, userEmail: currentUser.email }),
        });
        
        const session = await response.json();
        
        if (!response.ok) {
            throw new Error(session.error || 'Fehler bei der Kommunikation mit dem Server.');
        }

        const result = await stripe.redirectToCheckout({
            sessionId: session.sessionId,
        });

        if (result.error) {
            throw new Error(result.error.message);
        }
    } catch (err: any) {
        console.error('Stripe Checkout Fehler:', err);
        setError(err.message || 'Ein unerwarteter Fehler ist aufgetreten.');
        setIsLoading(false);
    }
    // No need to set isLoading to false here, as the user will be redirected.
  };


  const GeneralSettings = () => (
    <div className="space-y-6">
        <div className="space-y-2">
            <label htmlFor="language-select" className="block text-sm font-medium text-gray-300">
                Sprache für AI-Erklärungen
            </label>
            <p className="text-xs text-gray-400">Die App-Oberfläche bleibt auf Deutsch. Dies ändert nur die Sprache des Feedbacks von der AI.</p>
            <select 
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-white"
            >
                <option value="German">Deutsch</option>
                <option value="Romanian">Română</option>
                <option value="English">English</option>
                <option value="Polish">Polski</option>
            </select>
        </div>
        <div>
            <h4 className="font-semibold text-gray-200 mb-2">Erfolge</h4>
            <button 
                onClick={() => {
                    onClose();
                    onOpenAchievements();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            >
                <Icon name="trophy" className="h-5 w-5"/>
                <span>Meine Erfolge anzeigen</span>
            </button>
        </div>
    </div>
  );

  const BillingSettings = () => (
    <div className="space-y-6">
        <div>
            <p className="text-sm text-gray-400">Ihr aktuelles Guthaben:</p>
            <p className="text-3xl font-bold text-yellow-400">{currentUser?.credits.toLocaleString('de-DE')} Hub+1</p>
        </div>
        
        <div>
            <h4 className="font-semibold text-gray-200 mb-2">Guthaben aufladen</h4>
            {isLoading ? (
                <div className="flex justify-center items-center h-24">
                    <Loader text="Weiterleitung zu Stripe..." />
                </div>
            ) : (
                <div className="space-y-2">
                    {creditPackages.map(pkg => (
                        <div key={pkg.name} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                            <div>
                                <p className="font-semibold">{pkg.name}</p>
                                <p className="text-sm text-yellow-400">{pkg.credits.toLocaleString('de-DE')} Hub+1</p>
                            </div>
                            <button 
                                onClick={() => handlePurchase(pkg.priceId)}
                                className="px-4 py-1.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 text-sm"
                            >
                                {pkg.price} Kaufen
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-sm text-red-400 mt-2 text-center">{error}</p>}
            <p className="text-xs text-gray-500 mt-2">Die Bezahlung wird sicher über Stripe abgewickelt.</p>
        </div>

        <div>
            <h4 className="font-semibold text-gray-200 mb-2">Transaktionsverlauf</h4>
            <div className="max-h-48 overflow-y-auto bg-gray-900/50 p-2 rounded-md border border-gray-600">
                {currentUser?.transactions && currentUser.transactions.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase">
                            <tr>
                                <th className="px-2 py-1">Beschreibung</th>
                                <th className="px-2 py-1 text-right">Betrag</th>
                            </tr>
                        </thead>
                        <tbody>
                        {currentUser.transactions.map(t => (
                            <tr key={t.id} className="border-b border-gray-700 last:border-b-0">
                                <td className="px-2 py-2">
                                    <p className="font-medium text-gray-200">{t.description}</p>
                                    <p className="text-xs text-gray-500">{new Date(t.date).toLocaleString('de-DE')}</p>
                                </td>
                                <td className={`px-2 py-2 text-right font-semibold ${t.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {t.amount.toLocaleString('de-DE')}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-500 p-4">Keine Transaktionen vorhanden.</p>
                )}
            </div>
        </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg w-full max-w-lg shadow-xl border border-gray-700 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
            <h3 className="text-2xl font-bold text-white">Einstellungen</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
                <Icon name="close" className="h-6 w-6" />
            </button>
        </div>
        
        <div className="p-2 bg-gray-900">
            <div className="flex border-b border-gray-700">
                 <button 
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 py-2 text-center font-semibold transition-colors ${activeTab === 'general' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                >
                    Allgemein
                </button>
                <button 
                    onClick={() => setActiveTab('billing')}
                    className={`flex-1 py-2 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${activeTab === 'billing' ? 'text-white border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}
                >
                    <Icon name="credit-card" className="h-5 w-5"/>
                    Abrechnung & Guthaben
                </button>
            </div>
        </div>
        
        <div className="p-6 min-h-[300px]">
            {activeTab === 'general' ? <GeneralSettings /> : <BillingSettings />}
        </div>
        
        <div className="p-6 mt-auto border-t border-gray-700 flex justify-end bg-gray-800/50">
             <button 
                onClick={onClose} 
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
            >
                Schließen
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
