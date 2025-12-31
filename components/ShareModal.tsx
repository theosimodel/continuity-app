import React, { useState } from 'react';
import { X, Link, Globe, Copy, Check, Twitter, MessageCircle } from 'lucide-react';
import { List, Comic } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  // For lists
  list?: List | null;
  listAuthorName?: string;
  listCoverUrls?: string[];
  // For comics (future use)
  comic?: Comic | null;
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  list,
  listAuthorName,
  listCoverUrls = [],
  comic,
}) => {
  const [message, setMessage] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  if (!isOpen) return null;

  const shareUrl = window.location.href;
  const title = list?.title || comic?.title || 'Continuity';
  const author = listAuthorName || 'A reader';
  const visibility = list?.visibility || 'public';
  const isListShare = !!list;

  const defaultMessage = isListShare
    ? 'A curated reading path created in Continuity.'
    : `${title} — tracked in Continuity.`;

  const shareText = message.trim();

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const handleShareToX = () => {
    const tweetContent = shareText
      ? `${shareText}\n\n${shareUrl}`
      : shareUrl;
    const tweetText = encodeURIComponent(tweetContent);
    window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
  };

  const handleShareViaMessages = async () => {
    // Combine message and URL into single text for reliable sharing
    // (navigator.share with separate url/text fields doesn't work reliably on macOS)
    const fullShareText = shareText
      ? `${shareText}\n\n${shareUrl}`
      : shareUrl;

    if (navigator.share) {
      try {
        await navigator.share({
          text: fullShareText,
        });
      } catch (err) {
        // User cancelled or share failed - fall back to SMS
        const body = encodeURIComponent(fullShareText);
        window.open(`sms:?body=${body}`, '_blank');
      }
    } else {
      // Fallback for browsers without native share
      const body = encodeURIComponent(fullShareText);
      window.open(`sms:?body=${body}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161A21] rounded-xl w-full max-w-md border border-[#1E232B]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1E232B]">
          <h2 className="text-xl font-bold text-white">Share</h2>
          <button onClick={onClose} className="text-[#7C828D] hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Link Preview */}
          <div className="bg-[#0E1116] rounded-xl p-4 border border-[#1E232B]">
            {/* Cover stack for lists */}
            {isListShare && listCoverUrls.length > 0 && (
              <div className="flex -space-x-6 mb-4">
                {listCoverUrls.slice(0, 3).map((url, i) => (
                  <div
                    key={i}
                    className="w-14 h-20 rounded-lg overflow-hidden border-2 border-[#161A21] shadow-lg"
                    style={{ zIndex: 3 - i }}
                  >
                    <img
                      src={url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Comic cover */}
            {!isListShare && comic && (
              <div className="w-14 h-20 rounded-lg overflow-hidden border-2 border-[#161A21] shadow-lg mb-4">
                <img
                  src={comic.coverUrl}
                  alt={comic.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
            <p className="text-[#7C828D] text-sm mb-2">
              {isListShare ? `By ${author}` : `${comic?.year} · ${comic?.publisher}`}
            </p>

            {/* Visibility badge */}
            {isListShare && (
              <div className="flex items-center gap-1 text-[#7C828D] text-xs">
                {visibility === 'public' ? <Globe size={12} /> : <Link size={12} />}
                <span className="capitalize">{visibility}</span>
              </div>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">
              Add a message <span className="text-[#4A4F57]">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={defaultMessage}
              rows={3}
              className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4FD1C5] transition-colors resize-none"
            />
          </div>

          {/* Share Actions */}
          <div className="space-y-2">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 bg-[#4FD1C5] text-black font-bold py-3 rounded-lg hover:bg-[#3DBCB0] transition-colors"
            >
              {copyStatus === 'copied' ? (
                <>
                  <Check size={18} />
                  Link Copied
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Link
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleShareToX}
                className="flex items-center justify-center gap-2 bg-[#1E232B] text-white font-medium py-3 rounded-lg hover:bg-[#2A303C] transition-colors"
              >
                <Twitter size={18} />
                Share to X
              </button>
              <button
                onClick={handleShareViaMessages}
                className="flex items-center justify-center gap-2 bg-[#1E232B] text-white font-medium py-3 rounded-lg hover:bg-[#2A303C] transition-colors"
              >
                <MessageCircle size={18} />
                Messages
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
