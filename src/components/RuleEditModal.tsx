import { useState } from 'react';
import type { Rule } from '../App';

interface RuleEditModalProps {
  rule: Rule;
  onSave: (rule: Rule) => void;
  onClose: () => void;
}

function RuleEditModal({ rule, onSave, onClose }: RuleEditModalProps) {
  const [search, setSearch] = useState(rule.search);
  const [replace, setReplace] = useState(rule.replace);
  const [flags, setFlags] = useState(rule.flags);

  const handleSave = () => {
    onSave({
      ...rule,
      search,
      replace,
      flags
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-headline text-gray-800">ルール編集</h3>
          <button
            onClick={onClose}
            className="btn-icon"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              検索正規表現
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field font-mono"
              placeholder="例: \d{4}年"
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">正規表現パターンを入力してください</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              置換文字列
            </label>
            <input
              type="text"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              className="input-field font-mono"
              placeholder="例: $1年（西暦）"
            />
            <p className="mt-1 text-xs text-gray-500">$1, $2 などでキャプチャグループを参照できます</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              フラグ
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={flags.includes('g')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFlags(flags + 'g');
                    } else {
                      setFlags(flags.replace('g', ''));
                    }
                  }}
                  className="checkbox-custom mr-2"
                />
                <span className="text-sm">g (global)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={flags.includes('i')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFlags(flags + 'i');
                    } else {
                      setFlags(flags.replace('i', ''));
                    }
                  }}
                  className="checkbox-custom mr-2"
                />
                <span className="text-sm">i (ignore case)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={flags.includes('m')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFlags(flags + 'm');
                    } else {
                      setFlags(flags.replace('m', ''));
                    }
                  }}
                  className="checkbox-custom mr-2"
                />
                <span className="text-sm">m (multiline)</span>
              </label>
            </div>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="input-field mt-3 font-mono"
              placeholder="例: gi"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}

export default RuleEditModal;