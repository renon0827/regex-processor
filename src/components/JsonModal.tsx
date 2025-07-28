import { useState } from 'react';

interface JsonModalProps {
  title: string;
  content: string;
  onClose: () => void;
  readOnly?: boolean;
  onImport?: (json: string) => void;
}

function JsonModal({ title, content, onClose, readOnly, onImport }: JsonModalProps) {
  const [jsonContent, setJsonContent] = useState(content);

  const handleImport = () => {
    if (onImport) {
      onImport(jsonContent);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    alert('JSONをクリップボードにコピーしました');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content p-8 max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="btn-icon hover:bg-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 mb-6">
          <textarea
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            readOnly={readOnly}
            className="w-full h-full textarea-field font-mono text-sm bg-gray-50 min-h-[300px]"
            placeholder='[{"search": "\\\\d+", "replace": "数字", "flags": "g"}]'
          />
          <p className="mt-2 text-xs text-gray-500">
            {readOnly ? 'このJSONをコピーして保存できます' : 'JSONフォーマットでルールを入力してください'}
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          {readOnly && (
            <button
              onClick={handleCopy}
              className="btn-secondary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              コピー
            </button>
          )}
          {onImport && (
            <button
              onClick={handleImport}
              className="btn-primary"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              読み込む
            </button>
          )}
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

export default JsonModal;