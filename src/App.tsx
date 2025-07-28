import { useState, useEffect, useCallback, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import RuleItem from './components/RuleItem';

export interface Rule {
  id: string;
  search: string;
  replace: string;
  flags: string;
}

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [realTimeTransform, setRealTimeTransform] = useState(true);
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRuleId, setNewRuleId] = useState<string | null>(null);
  
  const inputTextareaRef = useRef<HTMLTextAreaElement>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const applyTransformations = useCallback(() => {
    let result = inputText;
    
    for (const rule of rules) {
      try {
        const regex = new RegExp(rule.search, rule.flags);
        // エスケープシーケンスを実際の文字に変換
        const processedReplace = rule.replace
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')
          .replace(/\\r/g, '\r');
        result = result.replace(regex, processedReplace);
      } catch (error) {
        console.error('Invalid regex:', error);
      }
    }
    
    setOutputText(result);
  }, [inputText, rules]);

  useEffect(() => {
    if (realTimeTransform) {
      applyTransformations();
    }
  }, [inputText, rules, realTimeTransform, applyTransformations]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedRules = params.get('rules');
    if (encodedRules) {
      try {
        const decodedRules = JSON.parse(atob(encodedRules));
        if (Array.isArray(decodedRules)) {
          setRules(decodedRules.map((rule, index) => ({ ...rule, id: Date.now() + index + '' })));
        }
      } catch (error) {
        console.error('Failed to parse rules from URL:', error);
      }
    }
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setRules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addRule = () => {
    const newRule: Rule = {
      id: Date.now().toString(),
      search: '',
      replace: '',
      flags: 'g'
    };
    setRules([...rules, newRule]);
    setNewRuleId(newRule.id);
  };

  const updateRule = (rule: Rule) => {
    setRules(rules.map(r => r.id === rule.id ? rule : r));
    if (newRuleId === rule.id) {
      setNewRuleId(null);
    }
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    if (newRuleId === id) {
      setNewRuleId(null);
    }
  };

  const exportToUrl = () => {
    const rulesWithoutId = rules.map(({ search, replace, flags }) => ({ search, replace, flags }));
    const encoded = btoa(JSON.stringify(rulesWithoutId));
    const url = `${window.location.origin}${window.location.pathname}?rules=${encoded}`;
    navigator.clipboard.writeText(url);
    alert('URLをクリップボードにコピーしました');
  };

  const exportToFile = () => {
    const rulesWithoutId = rules.map(({ search, replace, flags }) => ({ search, replace, flags }));
    const jsonString = JSON.stringify(rulesWithoutId, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `regex-rules-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          setRules(parsed.map((rule, index) => ({ ...rule, id: Date.now() + index + '' })));
          alert('JSONファイルを読み込みました');
        } else {
          alert('無効なJSON形式です');
        }
      } catch (error) {
        alert('JSONファイルの解析に失敗しました');
      }
    };
    reader.readAsText(file);
    
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  };


  useEffect(() => {
    let isResizing = false;
    
    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (isResizing) return;
      isResizing = true;
      
      requestAnimationFrame(() => {
        if (inputTextareaRef.current && outputTextareaRef.current) {
          // Find which textarea was resized
          const resizedEntry = entries[0];
          const newHeight = resizedEntry.target.getBoundingClientRect().height;
          
          // Apply the same height to both textareas
          inputTextareaRef.current.style.height = `${newHeight}px`;
          outputTextareaRef.current.style.height = `${newHeight}px`;
        }
        isResizing = false;
      });
    };

    // Use ResizeObserver to detect textarea resizes
    const resizeObserver = new ResizeObserver(handleResize);
    
    if (inputTextareaRef.current) {
      resizeObserver.observe(inputTextareaRef.current);
    }
    if (outputTextareaRef.current) {
      resizeObserver.observe(outputTextareaRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <h1 className="text-display-1 text-gray-800 mb-2">正規表現チェーン変換ツール</h1>
          <p className="text-subheading text-gray-600">複数の正規表現ルールを組み合わせて、テキストを自在に変換</p>
        </div>
        
        <div className="card elevation-1 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <label className="flex items-center cursor-pointer">
                <span className="text-body-1 text-gray-700 mr-3">リアルタイム変換</span>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={realTimeTransform}
                    onChange={(e) => setRealTimeTransform(e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </label>
              <button
                onClick={applyTransformations}
                className="btn-primary"
                disabled={realTimeTransform}
              >
                変換実行
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-body-2 text-gray-700 mb-2">
                入力テキスト
              </label>
              <textarea
                ref={inputTextareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="textarea-field textarea-resizable font-mono"
                placeholder="変換したいテキストを入力..."
                style={{ height: '10rem' }}
              />
            </div>

            <div>
              <label className="block text-body-2 text-gray-700 mb-2">
                変換後テキスト
              </label>
              <textarea
                ref={outputTextareaRef}
                value={outputText}
                readOnly
                className="textarea-field textarea-resizable bg-gray-50 font-mono"
                placeholder="変換結果がここに表示されます..."
                style={{ height: '10rem' }}
              />
            </div>
          </div>

        </div>

        <div className="card elevation-1 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-headline text-gray-800">ルール一覧</h2>
              <p className="text-caption text-gray-600 mt-1">ドラッグ&ドロップで順序を変更できます</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={exportToFile}
                className="btn-secondary"
              >
                <svg className="w-4 h-4 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                JSON保存
              </button>
              <label className="btn-secondary cursor-pointer">
                <svg className="w-4 h-4 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                JSON読込
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportToUrl}
                className="btn-secondary"
              >
                <svg className="w-4 h-4 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                URL出力
              </button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rules}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {rules.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-body-1 mb-2">まだルールがありません</p>
                    <p className="text-caption">下のボタンから最初のルールを追加してください</p>
                  </div>
                ) : (
                  rules.map((rule) => (
                    <RuleItem
                      key={rule.id}
                      rule={rule}
                      onUpdate={updateRule}
                      onDelete={() => deleteRule(rule.id)}
                      isNew={newRuleId === rule.id}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>

          <button
            onClick={addRule}
            className="mt-6 w-full btn-primary ripple"
          >
            ルールを追加
          </button>
        </div>


      </div>
    </div>
  );
}

export default App;