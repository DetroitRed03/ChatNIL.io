'use client';

import { useState, useRef } from 'react';
import {
  Upload,
  Search,
  Filter,
  Grid3X3,
  List,
  File,
  FileText,
  Image,
  FileSpreadsheet,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Plus,
  Send,
  X,
  MessageSquare
} from 'lucide-react';
import { useLibraryStore, type LibraryFile, type FileType, type ViewMode } from '@/lib/library-store';
import { addFileToLibrary } from '@/lib/library-store';
import { useChatHistoryStore } from '@/lib/chat-history-store';
import SharedInput, { type UploadedFile } from '@/components/SharedInput';
import { Message } from '@/lib/chat-store';
import { useRouter } from 'next/navigation';

export default function Library() {
  const {
    files,
    viewMode,
    setViewMode,
    activeFilter,
    setActiveFilter,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    searchQuery,
    setSearchQuery,
    getFilteredFiles,
    getFileStats,
    removeFile,
    updateFile
  } = useLibraryStore();

  const { sidebarCollapsed, newChat, addMessageToChat, setActiveChat } = useChatHistoryStore();
  const router = useRouter();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<LibraryFile | null>(null);
  const [showFileMenu, setShowFileMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat input state
  const [inputValue, setInputValue] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);

  const stats = getFileStats();
  const filteredFiles = getFilteredFiles();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    for (const file of droppedFiles) {
      await addFileToLibrary(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    for (const file of selectedFiles) {
      await addFileToLibrary(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: LibraryFile) => {
    switch (file.category) {
      case 'contract':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'image':
        return <Image className="w-8 h-8 text-green-500" />;
      case 'document':
        return <FileSpreadsheet className="w-8 h-8 text-blue-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const FilterButton = ({ type, label, count }: { type: FileType | 'all', label: string, count: number }) => (
    <button
      onClick={() => setActiveFilter(type)}
      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
        activeFilter === type
          ? 'bg-orange-100 text-orange-800 border border-orange-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label} ({count})
    </button>
  );

  const handleDownload = (file: LibraryFile) => {
    const url = URL.createObjectURL(file.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = (file: LibraryFile) => {
    if (file.category === 'image' && file.preview) {
      setSelectedFile(file);
    } else {
      const url = URL.createObjectURL(file.file);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
    }
  };

  // Chat functions
  const handleAddFile = (file: UploadedFile) => {
    setAttachedFiles(prev => [...prev, file]);
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    // Create a new chat for library-specific conversations
    const chatId = newChat('athlete'); // Default to athlete role

    // Create the user message
    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? attachedFiles : undefined
    };

    // Add message to chat
    addMessageToChat(chatId, userMessage);

    // Add context about selected library file if one is selected
    let contextMessage = inputValue.trim();
    if (selectedFile) {
      contextMessage = `[Library file: ${selectedFile.name}] ${contextMessage}`;
    }

    // Set the active chat and navigate to chat page
    setActiveChat(chatId);
    router.push('/');

    // Clear input
    setInputValue('');
    setAttachedFiles([]);
  };

  const getInputPlaceholder = () => {
    if (selectedFile) {
      return `Ask anything about ${selectedFile.name}...`;
    }
    return "Ask anything about your files...";
  };

  const FileCard = ({ file }: { file: LibraryFile }) => (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:scale-105 transition-all cursor-pointer relative group"
      onClick={() => setSelectedFile(file)}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowFileMenu(showFileMenu === file.id ? null : file.id);
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {showFileMenu === file.id && (
          <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[120px]">
            <button
              onClick={() => {
                handlePreview(file);
                setShowFileMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
            >
              <Eye className="w-3 h-3" />
              Preview
            </button>
            <button
              onClick={() => {
                handleDownload(file);
                setShowFileMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-3 h-3" />
              Download
            </button>
            <button
              onClick={() => {
                removeFile(file.id);
                setShowFileMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-red-600 flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center text-center">
        {file.preview ? (
          <img src={file.preview} alt={file.name} className="w-16 h-16 object-cover rounded-lg mb-3" />
        ) : (
          <div className="mb-3">{getFileIcon(file)}</div>
        )}

        <h3 className="text-sm font-medium text-gray-900 truncate w-full mb-1">{file.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{formatFileSize(file.size)}</p>
        <p className="text-xs text-gray-400">{file.uploadDate.toLocaleDateString()}</p>
      </div>
    </div>
  );

  const FileRow = ({ file }: { file: LibraryFile }) => (
    <div
      className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-orange-50 hover:border-orange-200 cursor-pointer group relative transition-colors"
      onClick={() => setSelectedFile(file)}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {file.preview ? (
          <img src={file.preview} alt={file.name} className="w-8 h-8 object-cover rounded" />
        ) : (
          getFileIcon(file)
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{file.name}</h3>
          <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 capitalize">{file.category}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowFileMenu(showFileMenu === file.id ? null : file.id);
          }}
          className="p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {showFileMenu === file.id && (
        <div className="absolute right-4 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[120px]">
          <button
            onClick={() => {
              handlePreview(file);
              setShowFileMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
          <button
            onClick={() => {
              handleDownload(file);
              setShowFileMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="w-3 h-3" />
            Download
          </button>
          <button
            onClick={() => {
              removeFile(file.id);
              setShowFileMenu(null);
            }}
            className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 text-red-600 flex items-center gap-2"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Library</h1>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterButton type="all" label="All" count={stats.total} />
            <FilterButton type="contract" label="Contracts" count={stats.contracts} />
            <FilterButton type="image" label="Images" count={stats.images} />
            <FilterButton type="document" label="Documents" count={stats.documents} />
            <FilterButton type="other" label="Other" count={stats.other} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filteredFiles.length === 0 ? (
          <div
            className={`h-full flex flex-col items-center justify-center p-4 sm:p-8 border-2 border-dashed rounded-lg mx-4 sm:mx-6 mt-4 transition-colors ${
              dragActive ? 'border-orange-400 bg-orange-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No files yet</h3>
            <p className="text-gray-500 text-center mb-4 text-sm sm:text-base">
              Drag and drop files here, or click the upload button to get started
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
            >
              Choose Files
            </button>
          </div>
        ) : (
          <div className="p-3 sm:p-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {filteredFiles.map(file => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {filteredFiles.map(file => (
                  <FileRow key={file.id} file={file} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInput}
        className="hidden"
        accept="*/*"
      />

      {/* Document Detail Modal with Chat */}
      {selectedFile && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-75 z-50"
            onClick={() => setSelectedFile(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(selectedFile)}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{selectedFile.name}</h3>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(selectedFile.size)} • {selectedFile.uploadDate.toLocaleDateString()} • {selectedFile.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload(selectedFile)}
                    className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content Area - Split View */}
              <div className="flex-1 flex overflow-hidden">
                {/* Document Preview Panel */}
                <div className="flex-1 bg-gray-100 p-4 overflow-y-auto flex items-center justify-center">
                  {selectedFile.category === 'image' && selectedFile.preview ? (
                    <img
                      src={selectedFile.preview}
                      alt={selectedFile.name}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        {getFileIcon(selectedFile)}
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedFile.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">Preview not available for this file type</p>
                      <button
                        onClick={() => handleDownload(selectedFile)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download to View
                      </button>
                    </div>
                  )}
                </div>

                {/* Chat Interface Panel */}
                <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-orange-50 flex-shrink-0">
                    <h4 className="font-semibold text-gray-900 mb-1">Ask about this document</h4>
                    <p className="text-xs text-gray-600">Chat with AI to understand and analyze this file</p>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <div className="flex items-start gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium text-orange-900">AI Assistant</p>
                      </div>
                      <p className="text-sm text-gray-700">
                        Hello! I can help you understand this document. You can ask me:
                      </p>
                      <ul className="text-sm text-gray-700 mt-2 space-y-1 list-disc list-inside">
                        <li>What are the key points?</li>
                        <li>Summarize this document</li>
                        <li>Explain specific sections</li>
                        <li>Extract important information</li>
                      </ul>
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="relative">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder={`Ask about ${selectedFile.name}...`}
                        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Press Enter to send, or click the send button
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Persistent AI Input Field - Always visible at bottom */}
      <div className={`fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 p-4 z-30 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-12' : 'ml-64'
      }`}>
        <div className="max-w-4xl mx-auto">
          <SharedInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendMessage={handleSendMessage}
            placeholder={getInputPlaceholder()}
            attachedFiles={attachedFiles}
            onAddFile={handleAddFile}
            onRemoveFile={handleRemoveFile}
            mode="library"
          />
        </div>
      </div>
    </div>
  );
}