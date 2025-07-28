import { useState, useRef, useEffect, memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Rule } from '../App';

interface RuleItemProps {
  rule: Rule;
  onUpdate: (rule: Rule) => void;
  onDelete: () => void;
  isNew?: boolean;
}

const RuleItem = memo(function RuleItem({ rule, onUpdate, onDelete, isNew = false }: RuleItemProps) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [search, setSearch] = useState(rule.search);
  const [replace, setReplace] = useState(rule.replace);
  const [flags, setFlags] = useState(rule.flags);
  const searchInputRef = useRef<HTMLTextAreaElement>(null);
  const replaceInputRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return;
    
    let isResizing = false;
    
    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (isResizing) return;
      isResizing = true;
      
      requestAnimationFrame(() => {
        if (searchInputRef.current && replaceInputRef.current) {
          const resizedEntry = entries[0];
          const newHeight = resizedEntry.target.getBoundingClientRect().height;
          
          searchInputRef.current.style.height = `${newHeight}px`;
          replaceInputRef.current.style.height = `${newHeight}px`;
        }
        isResizing = false;
      });
    };

    const resizeObserver = new ResizeObserver(handleResize);
    
    if (searchInputRef.current) {
      resizeObserver.observe(searchInputRef.current);
    }
    if (replaceInputRef.current) {
      resizeObserver.observe(replaceInputRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [isEditing]);

  const handleSave = () => {
    onUpdate({
      ...rule,
      search,
      replace,
      flags
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (isNew) {
      onDelete();
    } else {
      setSearch(rule.search);
      setReplace(rule.replace);
      setFlags(rule.flags);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rule-item flex items-start group p-4"
      >
        <div className="w-5 mr-4">
          {/* Empty space to maintain layout alignment */}
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">検索正規表現</label>
              <textarea
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="textarea-field font-mono text-sm min-h-[2.5rem]"
                placeholder="例: \d{4}年"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                置換文字列
                <span className="text-xs text-gray-500 ml-1">(\n = 改行)</span>
              </label>
              <textarea
                ref={replaceInputRef}
                value={replace}
                onChange={(e) => setReplace(e.target.value)}
                onKeyDown={handleKeyDown}
                className="textarea-field font-mono text-sm min-h-[2.5rem]"
                placeholder="例: $1年（西暦）"
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="block text-xs font-medium text-gray-600">フラグ:</label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={flags.includes('g')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFlags(flags.includes('g') ? flags : flags + 'g');
                    } else {
                      setFlags(flags.replace('g', ''));
                    }
                  }}
                  className="checkbox-custom mr-2"
                />
                <span className="text-sm">g (全置換)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={flags.includes('i')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFlags(flags.includes('i') ? flags : flags + 'i');
                    } else {
                      setFlags(flags.replace('i', ''));
                    }
                  }}
                  className="checkbox-custom mr-2"
                />
                <span className="text-sm">i (大小文字無視)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={flags.includes('m')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFlags(flags.includes('m') ? flags : flags + 'm');
                    } else {
                      setFlags(flags.replace('m', ''));
                    }
                  }}
                  className="checkbox-custom mr-2"
                />
                <span className="text-sm">m (複数行)</span>
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="btn-primary text-xs py-1 px-3"
                title="Ctrl+Enter"
              >
                保存
              </button>
              <button
                onClick={handleCancel}
                className="btn-secondary text-xs py-1 px-3"
                title="Esc"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rule-item flex items-center group py-2"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-move mr-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="rule-code text-blue-600 font-semibold" title={`/${rule.search}/${rule.flags}`}>/{rule.search}/{rule.flags}</span>
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="rule-code text-green-600 font-semibold" title={rule.replace || '(空文字)'}>{rule.replace || '(空文字)'}</span>
        </div>
      </div>

      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={() => setIsEditing(true)}
          className="btn-icon"
          title="編集"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        
        <button
          onClick={onDelete}
          className="btn-icon hover:bg-red-100 hover:text-red-600"
          title="削除"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
});

export default RuleItem;