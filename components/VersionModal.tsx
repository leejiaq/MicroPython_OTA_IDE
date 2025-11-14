interface TimestampModalProps {
  timestamps: string[];
  onClose: () => void;
  onSelect: (ts: string) => void;
}

export default function TimestampModal({
  timestamps,
  onClose,
  onSelect
}: TimestampModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-slate-900/60 backdrop-blur-2xl max-w-[80vw] rounded-xl p-6 shadow-lg max-h-[80vh] overflow-hidden">

        <h2 className="text-lg font-bold mb-4">Saved Versions</h2>

        <div className="space-y-2 overflow-y-auto pr-1 h-full">
          {timestamps.map((ts) => {
            const time = ts; // extract timestamp
            return (
              <button
                key={ts}
                onClick={() => onSelect(ts)}
                className="w-full text-left p-2 rounded-md hover:bg-gray-800 text-sm"
              >
                {new Date(time).toLocaleString()}
              </button>
            );
          })}
        </div>

        <button
          className="mt-4 w-full py-2 rounded-lg bg-gray-800 text-white"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}