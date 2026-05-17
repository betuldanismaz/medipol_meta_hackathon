type Props = {
  onLeft: () => void;
  onRight: () => void;
  disabled?: boolean;
};

export default function SwipeButtons({ onLeft, onRight, disabled }: Props) {
  return (
    <div className="flex gap-6">
      <button
        onClick={onLeft}
        disabled={disabled}
        aria-label="Geç"
        className="w-16 h-16 rounded-full border-2 border-red-400 text-red-400 text-2xl flex items-center justify-center
                   hover:bg-red-50 dark:hover:bg-red-950 active:scale-95 transition-all
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ✕
      </button>
      <button
        onClick={onRight}
        disabled={disabled}
        aria-label="Başvur"
        className="w-16 h-16 rounded-full border-2 border-green-500 text-green-500 text-2xl flex items-center justify-center
                   hover:bg-green-50 dark:hover:bg-green-950 active:scale-95 transition-all
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ♥
      </button>
    </div>
  );
}
