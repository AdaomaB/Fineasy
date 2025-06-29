import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Trash2, 
  Download, 
  Eye, 
  Search,
  Filter,
  Calendar,
  Tag,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import Tesseract from 'tesseract.js';

interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  status: 'processing' | 'completed' | 'error';
  extractedData?: {
    amount?: number;
    date?: string;
    vendor?: string;
    description?: string;
  };
  category?: string;
  tags?: string[];
  preview?: string;
}

const DocumentUpload: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);

  const categories = [
    { value: 'all', label: 'All Documents' },
    { value: 'receipts', label: 'Receipts' },
    { value: 'invoices', label: 'Invoices' },
    { value: 'bank-statements', label: 'Bank Statements' },
    { value: 'contracts', label: 'Contracts' },
    { value: 'tax-documents', label: 'Tax Documents' },
    { value: 'other', label: 'Other' }
  ];

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    
    for (const file of acceptedFiles) {
      const newDocument: UploadedDocument = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date(),
        status: 'processing',
        category: 'other'
      };

      setDocuments(prev => [...prev, newDocument]);

      try {
        // Create preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setDocuments(prev => 
              prev.map(doc => 
                doc.id === newDocument.id 
                  ? { ...doc, preview: e.target?.result as string }
                  : doc
              )
            );
          };
          reader.readAsDataURL(file);

          // Perform OCR on images
          const { data: { text } } = await Tesseract.recognize(file, 'eng');
          
          // Extract data from OCR text
          const extractedData = extractDataFromText(text);
          const category = categorizeDocument(file.name, text);

          setDocuments(prev => 
            prev.map(doc => 
              doc.id === newDocument.id 
                ? { 
                    ...doc, 
                    status: 'completed', 
                    extractedData,
                    category,
                    tags: generateTags(text)
                  }
                : doc
            )
          );
        } else {
          // For non-image files, just mark as completed
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === newDocument.id 
                ? { ...doc, status: 'completed' }
                : doc
            )
          );
        }

        toast.success(`${file.name} uploaded and processed successfully!`);
      } catch (error) {
        console.error('Error processing file:', error);
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === newDocument.id 
              ? { ...doc, status: 'error' }
              : doc
          )
        );
        toast.error(`Error processing ${file.name}`);
      }
    }

    setIsProcessing(false);
  }, []);

  const extractDataFromText = (text: string) => {
    const extractedData: any = {};

    // Extract amount (looking for currency patterns)
    const amountMatch = text.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (amountMatch) {
      extractedData.amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    }

    // Extract date patterns
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    if (dateMatch) {
      extractedData.date = dateMatch[1];
    }

    // Extract vendor/company name (usually in caps or at the top)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      extractedData.vendor = lines[0].trim();
    }

    return extractedData;
  };

  const categorizeDocument = (filename: string, text: string): string => {
    const lowerFilename = filename.toLowerCase();
    const lowerText = text.toLowerCase();

    if (lowerFilename.includes('receipt') || lowerText.includes('receipt')) {
      return 'receipts';
    }
    if (lowerFilename.includes('invoice') || lowerText.includes('invoice')) {
      return 'invoices';
    }
    if (lowerFilename.includes('bank') || lowerText.includes('statement')) {
      return 'bank-statements';
    }
    if (lowerFilename.includes('contract') || lowerText.includes('agreement')) {
      return 'contracts';
    }
    if (lowerFilename.includes('tax') || lowerText.includes('tax')) {
      return 'tax-documents';
    }

    return 'other';
  };

  const generateTags = (text: string): string[] => {
    const tags: string[] = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('expense')) tags.push('expense');
    if (lowerText.includes('income')) tags.push('income');
    if (lowerText.includes('office')) tags.push('office');
    if (lowerText.includes('travel')) tags.push('travel');
    if (lowerText.includes('meal')) tags.push('meals');
    if (lowerText.includes('fuel') || lowerText.includes('gas')) tags.push('fuel');

    return tags;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.csv']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast.success('Document deleted successfully');
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.extractedData?.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Document Upload & OCR
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Upload receipts, invoices, and financial documents for automatic data extraction
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Documents</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {documents.length}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              
              {isDragActive ? (
                <p className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                  Drop the files here...
                </p>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-2">
                    Drag & drop files here, or click to select
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Supports: Images (PNG, JPG, JPEG, GIF), PDF, Text files
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Maximum file size: 10MB
                  </p>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing documents...
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Documents Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredDocuments.map((document, index) => {
              const FileIcon = getFileIcon(document.type);
              return (
                <motion.div
                  key={document.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  {/* Document Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <FileIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {document.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(document.size)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {document.status === 'processing' && (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                      {document.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {document.status === 'error' && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Preview */}
                  {document.preview && (
                    <div className="mb-4">
                      <img
                        src={document.preview}
                        alt={document.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Extracted Data */}
                  {document.extractedData && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Extracted Data:
                      </h4>
                      <div className="space-y-1 text-xs">
                        {document.extractedData.vendor && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Vendor:</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {document.extractedData.vendor}
                            </span>
                          </div>
                        )}
                        {document.extractedData.amount && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              ${document.extractedData.amount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        {document.extractedData.date && (
                          <div className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400">Date:</span>
                            <span className="text-gray-900 dark:text-white font-medium">
                              {document.extractedData.date}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {document.tags && document.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {document.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category */}
                  <div className="mb-4">
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                      {categories.find(cat => cat.value === document.category)?.label || 'Other'}
                    </span>
                  </div>

                  {/* Upload Date */}
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <Calendar className="w-3 h-3 mr-1" />
                    {document.uploadDate.toLocaleDateString()}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedDocument(document)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => deleteDocument(document.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No documents found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {documents.length === 0 
                  ? 'Upload your first document to get started'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DocumentUpload;