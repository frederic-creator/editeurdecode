import React, { useState, useEffect } from 'react';
import { Download, Eye, X, AlertCircle, Check, Archive, FileText } from 'lucide-react';

type EditorTab = 'html' | 'css' | 'js';

interface ValidationError {
  type: EditorTab;
  message: string;
}

interface FileNames {
  css: string;
  js: string;
}

function App() {
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [jsCode, setJsCode] = useState('');
  const [projectName, setProjectName] = useState('');
  const [fileNames, setFileNames] = useState<FileNames>({
    css: 'styles.css',
    js: 'script.js'
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<EditorTab>('html');
  const [isEditingFileName, setIsEditingFileName] = useState<'css' | 'js' | null>(null);

  const validateCode = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (htmlCode.trim() && !htmlCode.includes('<')) {
      errors.push({ type: 'html', message: 'Le code HTML semble invalide' });
    }

    if (cssCode.trim() && !cssCode.includes('{')) {
      errors.push({ type: 'css', message: 'Le code CSS semble invalide' });
    }

    try {
      if (jsCode.trim()) {
        new Function(jsCode);
      }
    } catch (e) {
      errors.push({ type: 'js', message: 'Le code JavaScript contient une erreur de syntaxe' });
    }

    return errors;
  };

  const validateProjectName = (): boolean => {
    if (!projectName.trim()) {
      setStatus('error');
      setErrorMessage('Veuillez entrer un nom de projet avant de sauvegarder');
      return false;
    }
    return true;
  };

  const handlePreview = () => {
    const errors = validateCode();
    if (errors.length > 0) {
      setStatus('error');
      setErrorMessage(errors.map(e => e.message).join(', '));
      return;
    }

    setIsPreviewOpen(true);
    setStatus('success');
  };

  const generatePreviewHtml = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
          <script>${jsCode}</script>
        </body>
      </html>
    `;
  };

  const handleDownload = (type: EditorTab) => {
    if (!validateProjectName()) return;

    const content = type === 'html' ? htmlCode : type === 'css' ? cssCode : jsCode;
    const fileName = type === 'html' 
      ? `${projectName}.html` 
      : type === 'css' 
        ? fileNames.css 
        : fileNames.js;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    if (!validateProjectName()) return;

    handleDownload('html');
    handleDownload('css');
    handleDownload('js');
    setStatus('success');
    setErrorMessage('Fichiers téléchargés avec succès');
  };

  const handleFileNameChange = (type: 'css' | 'js', value: string) => {
    const extension = type === 'css' ? '.css' : '.js';
    let newName = value;
    
    if (!newName.endsWith(extension)) {
      newName = newName.replace(/\.[^/.]+$/, '') + extension;
    }
    
    setFileNames(prev => ({
      ...prev,
      [type]: newName
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Éditeur de Code Web
            </h1>
            <div className="relative">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Nom du projet"
                className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePreview}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Eye className="w-5 h-5 mr-2" />
              Prévisualiser
            </button>
            <button
              onClick={handleDownloadAll}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Archive className="w-5 h-5 mr-2" />
              Télécharger tout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('html')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'html'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              HTML
            </button>
            <button
              onClick={() => setActiveTab('css')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'css'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              CSS
            </button>
            <button
              onClick={() => setActiveTab('js')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'js'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              JavaScript
            </button>
          </div>

          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {activeTab === 'html'
                    ? 'Code HTML'
                    : activeTab === 'css'
                    ? 'Styles CSS'
                    : 'Code JavaScript'}
                </h2>
                {activeTab !== 'html' && (
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    {isEditingFileName === activeTab ? (
                      <input
                        type="text"
                        value={activeTab === 'css' ? fileNames.css : fileNames.js}
                        onChange={(e) => handleFileNameChange(activeTab, e.target.value)}
                        onBlur={() => setIsEditingFileName(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setIsEditingFileName(null)}
                        className="px-2 py-1 text-sm border rounded-md"
                        autoFocus
                      />
                    ) : (
                      <span
                        onClick={() => setIsEditingFileName(activeTab)}
                        className="text-sm text-gray-600 cursor-pointer hover:text-gray-900"
                      >
                        {activeTab === 'css' ? fileNames.css : fileNames.js}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleDownload(activeTab)}
                className="flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="w-4 h-4 mr-1" />
                Télécharger
              </button>
            </div>
            <textarea
              value={
                activeTab === 'html'
                  ? htmlCode
                  : activeTab === 'css'
                  ? cssCode
                  : jsCode
              }
              onChange={(e) =>
                activeTab === 'html'
                  ? setHtmlCode(e.target.value)
                  : activeTab === 'css'
                  ? setCssCode(e.target.value)
                  : setJsCode(e.target.value)
              }
              className="w-full h-96 p-4 font-mono text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={
                activeTab === 'html'
                  ? 'Entrez votre code HTML ici...'
                  : activeTab === 'css'
                  ? 'Entrez vos styles CSS ici...'
                  : 'Entrez votre code JavaScript ici...'
              }
            />
          </div>
        </div>

        {status === 'error' && (
          <div className="mt-4 flex items-center text-red-600 bg-red-50 p-3 rounded-md">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errorMessage}
          </div>
        )}

        {status === 'success' && (
          <div className="mt-4 flex items-center text-green-600 bg-green-50 p-3 rounded-md">
            <Check className="w-5 h-5 mr-2" />
            Action effectuée avec succès !
          </div>
        )}

        {isPreviewOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-medium">Prévisualisation</h3>
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <iframe
                  srcDoc={generatePreviewHtml()}
                  className="w-full h-full min-h-[500px] border rounded-md"
                  title="preview"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;