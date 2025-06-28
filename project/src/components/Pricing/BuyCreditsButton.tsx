import React from 'react';
import { CreditCard, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface BuyCreditsButtonProps {
  onClick: () => void;
}

const BuyCreditsButton: React.FC<BuyCreditsButtonProps> = ({ onClick }) => {
  const { profile } = useAuthStore();

  const getCreditColor = () => {
    if (!profile) return 'text-stone-600';
    if (profile.credits <= 5) return 'text-red-600';
    if (profile.credits <= 20) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center space-x-3">
      {/* Credits Display */}
      <div className="bg-white border border-stone-200 rounded-lg px-4 py-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <Zap className={`w-4 h-4 ${getCreditColor()}`} />
          <span className={`text-sm font-medium ${getCreditColor()}`}>
            {profile?.credits || 0} credits
          </span>
        </div>
      </div>

      {/* Buy Credits Button */}
      <button
        onClick={onClick}
        className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-stone-800 font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
      >
        <CreditCard className="w-4 h-4" />
        <span>Buy Credits</span>
      </button>
    </div>
  );
};

export default BuyCreditsButton;