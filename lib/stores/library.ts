import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FileType = 'contract' | 'image' | 'document' | 'other';
export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'type';

export interface LibraryFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileType;
  file: File;
  preview?: string;
  uploadDate: Date;
  lastModified: Date;
  description?: string;
  tags?: string[];
}

export interface LibraryState {
  // Files
  files: LibraryFile[];
  addFile: (file: LibraryFile) => void;
  removeFile: (fileId: string) => void;
  updateFile: (fileId: string, updates: Partial<LibraryFile>) => void;

  // View state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Filtering
  activeFilter: FileType | 'all';
  setActiveFilter: (filter: FileType | 'all') => void;

  // Sorting
  sortBy: SortBy;
  sortOrder: 'asc' | 'desc';
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Getters
  getFilteredFiles: () => LibraryFile[];
  getFilesByCategory: (category: FileType) => LibraryFile[];
  getFileStats: () => {
    total: number;
    contracts: number;
    images: number;
    documents: number;
    other: number;
  };
}

// Helper functions
function categorizeFile(file: File): FileType {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Contracts (PDFs, Word docs)
  if (
    mimeType.includes('pdf') ||
    mimeType.includes('msword') ||
    mimeType.includes('wordprocessingml') ||
    ['pdf', 'doc', 'docx'].includes(extension)
  ) {
    return 'contract';
  }

  // Images
  if (
    mimeType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)
  ) {
    return 'image';
  }

  // Documents
  if (
    mimeType.includes('text') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation') ||
    ['txt', 'md', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)
  ) {
    return 'document';
  }

  return 'other';
}

function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createLibraryFile(file: File): LibraryFile {
  const now = new Date();
  return {
    id: generateFileId(),
    name: file.name,
    size: file.size,
    type: file.type,
    category: categorizeFile(file),
    file,
    uploadDate: now,
    lastModified: new Date(file.lastModified),
    tags: []
  };
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      // Files
      files: [],
      addFile: (file) =>
        set((state) => ({
          files: [file, ...state.files]
        })),
      removeFile: (fileId) =>
        set((state) => ({
          files: state.files.filter(f => f.id !== fileId)
        })),
      updateFile: (fileId, updates) =>
        set((state) => ({
          files: state.files.map(f =>
            f.id === fileId ? { ...f, ...updates } : f
          )
        })),

      // View state
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),

      // Filtering
      activeFilter: 'all',
      setActiveFilter: (filter) => set({ activeFilter: filter }),

      // Sorting
      sortBy: 'date',
      sortOrder: 'desc',
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Getters
      getFilteredFiles: () => {
        const { files, activeFilter, searchQuery, sortBy, sortOrder } = get();

        // Filter by category
        let filteredFiles = activeFilter === 'all'
          ? files
          : files.filter(file => file.category === activeFilter);

        // Filter by search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredFiles = filteredFiles.filter(file =>
            file.name.toLowerCase().includes(query) ||
            file.description?.toLowerCase().includes(query) ||
            file.tags?.some(tag => tag.toLowerCase().includes(query))
          );
        }

        // Sort files
        filteredFiles.sort((a, b) => {
          let comparison = 0;

          switch (sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'date':
              comparison = a.uploadDate.getTime() - b.uploadDate.getTime();
              break;
            case 'size':
              comparison = a.size - b.size;
              break;
            case 'type':
              comparison = a.type.localeCompare(b.type);
              break;
          }

          return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filteredFiles;
      },

      getFilesByCategory: (category) => {
        const { files } = get();
        return files.filter(file => file.category === category);
      },

      getFileStats: () => {
        const { files } = get();
        return {
          total: files.length,
          contracts: files.filter(f => f.category === 'contract').length,
          images: files.filter(f => f.category === 'image').length,
          documents: files.filter(f => f.category === 'document').length,
          other: files.filter(f => f.category === 'other').length
        };
      }
    }),
    {
      name: 'library-storage',
      partialize: (state) => ({
        // Only persist metadata, not actual File objects
        files: state.files.map(file => ({
          ...file,
          file: undefined // Remove File object for serialization
        })),
        viewMode: state.viewMode,
        activeFilter: state.activeFilter,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.files) {
          // Convert date strings back to Date objects
          state.files = state.files.map(file => ({
            ...file,
            uploadDate: new Date(file.uploadDate),
            lastModified: new Date(file.lastModified),
            file: undefined as any // File objects can't be persisted
          }));
        }
      }
    }
  )
);

// Helper function to create and add file to store
export const addFileToLibrary = async (file: File): Promise<LibraryFile> => {
  const libraryFile = createLibraryFile(file);

  // Generate preview for images
  if (libraryFile.category === 'image') {
    try {
      const preview = await generateImagePreview(file);
      libraryFile.preview = preview;
    } catch (error) {
      console.warn('Failed to generate image preview:', error);
    }
  }

  useLibraryStore.getState().addFile(libraryFile);
  return libraryFile;
};

// Generate image preview
function generateImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Generate thumbnail (max 200x200)
        const maxSize = 200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}