import React, { useState, useEffect } from 'react';
import { X, Lock, Link, Globe, Trash2 } from 'lucide-react';
import { ListVisibility, List } from '../types';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, visibility: ListVisibility) => void;
  onDelete?: (listId: string) => void;
  editList?: List | null; // If provided, we're in edit mode
}

const CreateListModal: React.FC<CreateListModalProps> = ({ isOpen, onClose, onSave, onDelete, editList }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<ListVisibility>('private');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditMode = !!editList;

  // Populate fields when editing
  useEffect(() => {
    if (editList) {
      setTitle(editList.title);
      setDescription(editList.description || '');
      setVisibility(editList.visibility);
    } else {
      setTitle('');
      setDescription('');
      setVisibility('private');
    }
    setShowDeleteConfirm(false);
  }, [editList, isOpen]);

  const handleDelete = async () => {
    if (editList && onDelete) {
      await onDelete(editList.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    await onSave(title.trim(), description.trim(), visibility);
    setIsSaving(false);
    if (!isEditMode) {
      setTitle('');
      setDescription('');
      setVisibility('private');
    }
    onClose();
  };

  const visibilityOptions: { value: ListVisibility; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'private', label: 'Private', icon: <Lock size={16} />, desc: 'Only you can see' },
    { value: 'unlisted', label: 'Unlisted', icon: <Link size={16} />, desc: 'Anyone with link' },
    { value: 'public', label: 'Public', icon: <Globe size={16} />, desc: 'Discoverable' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161A21] rounded-xl w-full max-w-md border border-[#1E232B]">
        <div className="flex items-center justify-between p-6 border-b border-[#1E232B]">
          <h2 className="text-xl font-bold text-white">{isEditMode ? 'Edit List' : 'Create List'}</h2>
          <button onClick={onClose} className="text-[#7C828D] hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Grant Morrison — The Good Stuff"
              className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4FD1C5] transition-colors"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">
              Description <span className="text-[#4A4F57]">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Where to start if you're curious about Morrison but don't want the chaos."
              rows={3}
              className="w-full bg-[#0E1116] border border-[#1E232B] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#4FD1C5] transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-[#7C828D] font-bold tracking-widest uppercase">
              Visibility
            </label>
            <div className="grid grid-cols-3 gap-2">
              {visibilityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setVisibility(opt.value)}
                  className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-1 ${
                    visibility === opt.value
                      ? 'border-[#4FD1C5] bg-[#4FD1C5]/10 text-[#4FD1C5]'
                      : 'border-[#1E232B] text-[#7C828D] hover:border-[#2A303C]'
                  }`}
                >
                  {opt.icon}
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-[#7C828D] text-center mt-2">
              {visibilityOptions.find(o => o.value === visibility)?.desc}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-[#1E232B]">
          {/* Delete confirmation */}
          {isEditMode && showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-[#7C828D] text-sm text-center">Delete this list? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-lg border border-[#1E232B] text-white font-medium hover:bg-[#1E232B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                >
                  Delete List
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-lg border border-[#1E232B] text-white font-medium hover:bg-[#1E232B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || isSaving}
                  className="flex-1 py-3 rounded-lg bg-[#4FD1C5] text-black font-bold hover:bg-[#3DBCB0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create List')}
                </button>
              </div>
              {isEditMode && onDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2 text-red-400 text-sm font-medium hover:text-red-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete List
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateListModal;
