import 'dart:io';
import 'dart:typed_data';
import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;
import 'package:flutter/material.dart';

import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:google_mlkit_document_scanner/google_mlkit_document_scanner.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/theme/app_tokens.dart';
import '../../data/models/document.dart';
import '../../data/models/scanned_page.dart';
import 'package:image_picker/image_picker.dart';
import '../../data/services/document_service.dart';
import 'package:file_picker/file_picker.dart';
import '../../data/services/api_service.dart';
import '../../data/engines/offline_engine_manager.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';

class ActiveJob {
  final String id;
  final String toolId;
  final String status; // 'processing', 'completed', 'failed'
  final DateTime timestamp;
  final String details;

  ActiveJob({
    required this.id,
    required this.toolId,
    required this.status,
    required this.timestamp,
    required this.details,
  });
}

enum AppScreen {
  onboarding,
  dashboard,
  scanPreview,
  pdfViewer,
  editDocument,
  fileDetails,
  search,
}

class AppState extends ChangeNotifier {
  final DocumentService _service = DocumentService();
  final List<ActiveJob> _activeJobs = [];
  List<ActiveJob> get activeJobs => _activeJobs;

  final Map<String, List<dynamic>> _documentImageCache = {};
  List<dynamic>? getDocumentImages(String docId) => _documentImageCache[docId];

  final Map<String, List<String>> _documentTextCache = {};
  String? getDocumentPageText(String docId, int index) {
    final list = _documentTextCache[docId];
    if (list != null && index >= 0 && index < list.length) {
      return list[index];
    }
    return null;
  }

  void clearActiveJobs() {
    _activeJobs.removeWhere((job) => job.status != 'processing');
    notifyListeners();
  }

  String? _token;
  String? _userName;
  String? _userEmail;
  String? _userPlan;

  String? get token => _token;
  String? get userName => _userName;
  String? get userEmail => _userEmail;
  String? get userPlan => _userPlan;
  bool get isLoggedIn => _token != null;

  AppState() {
    _init();
  }

  Future<void> _init() async {
    await _service.initLocalData();
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('auth_token');
      _userName = prefs.getString('auth_name');
      _userEmail = prefs.getString('auth_email');
      _userPlan = prefs.getString('auth_plan') ?? 'Free Plan';
    } catch (e) {
      debugPrint("Error loading auth preferences: $e");
    }
    notifyListeners();
  }

  Future<bool> registerUser(String name, String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/api/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
        }),
      );
      if (response.statusCode == 201) {
        return true;
      } else {
        final err = jsonDecode(response.body)['error'] ?? 'Registration failed';
        throw Exception(err);
      }
    } catch (e) {
      debugPrint('Registration error: $e');
      rethrow;
    }
  }

  Future<bool> loginUser(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiService.baseUrl}/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
        }),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _token = data['token'];
        _userName = data['user']['name'];
        _userEmail = data['user']['email'];
        _userPlan = data['user']['plan'] ?? 'Free Plan';

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_token', _token!);
        await prefs.setString('auth_name', _userName ?? '');
        await prefs.setString('auth_email', _userEmail ?? '');
        await prefs.setString('auth_plan', _userPlan ?? 'Free Plan');

        notifyListeners();
        return true;
      } else {
        final err = jsonDecode(response.body)['error'] ?? 'Login failed';
        throw Exception(err);
      }
    } catch (e) {
      debugPrint('Login error: $e');
      rethrow;
    }
  }

  Future<void> logoutUser() async {
    try {
      if (_token != null) {
        await http.post(
          Uri.parse('${ApiService.baseUrl}/api/auth/logout'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_token',
          },
        );
      }
    } catch (e) {
      debugPrint('Logout api error: $e');
    } finally {
      _token = null;
      _userName = null;
      _userEmail = null;
      _userPlan = null;

      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('auth_name');
      await prefs.remove('auth_email');
      await prefs.remove('auth_plan');

      notifyListeners();
    }
  }
  
  // Navigation State
  AppScreen _currentScreen = AppScreen.onboarding;
  AppScreen get currentScreen => _currentScreen;

  int _bottomNavIndex = 0;
  int get bottomNavIndex => _bottomNavIndex;

  // Folder Navigation State
  String? _currentFolderId;
  String? get currentFolderId => _currentFolderId;

  // Sorting State
  String _sortBy = 'date_desc'; // date_desc (latest first), date_asc, name_asc, name_desc, size_desc, size_asc
  String get sortBy => _sortBy;

  void setBottomNavIndex(int index) {
    _bottomNavIndex = index;
    notifyListeners();
  }

  // Search and Filter States
  String _activeFilter = 'All';
  String get activeFilter => _activeFilter;

  // Separate search queries per view tab
  String _homeSearchQuery = '';
  String get homeSearchQuery => _homeSearchQuery;

  String _recentSearchQuery = '';
  String get recentSearchQuery => _recentSearchQuery;

  String _likedSearchQuery = '';
  String get likedSearchQuery => _likedSearchQuery;

  // Global search (redirected Search screen)
  String _searchQuery = '';
  String get searchQuery => _searchQuery;

  // Selected document for details/viewing/editing
  Document? _selectedDocument;
  Document? get selectedDocument => _selectedDocument;

  // Theme Toggler
  ThemeMode _themeMode = ThemeMode.system;
  ThemeMode get themeMode => _themeMode;

  // Recently used tools on home tab
  List<String> _recentlyUsedTools = ['OCR Text Scanner', 'Digital Signer'];
  List<String> get recentlyUsedTools => _recentlyUsedTools;

  void useTool(String toolName) {
    _recentlyUsedTools.remove(toolName);
    _recentlyUsedTools.insert(0, toolName);
    if (_recentlyUsedTools.length > 2) {
      _recentlyUsedTools = _recentlyUsedTools.sublist(0, 2);
    }
    notifyListeners();
  }

  // Temporary Scan Data
  String _scannedTitle = 'New Scanned Document.pdf';
  String get scannedTitle => _scannedTitle;

  String _scannedFilter = 'Original';
  String get scannedFilter => _scannedFilter;

  // Captured Image from real camera (kept for compatibility)
  Uint8List? _capturedImageBytes;
  Uint8List? get capturedImageBytes => _scannedPages.isNotEmpty && _activePageIndex < _scannedPages.length ? _scannedPages[_activePageIndex].imageBytes : _capturedImageBytes;

  // Multipage Scan State
  List<ScannedPage> _scannedPages = [];
  List<ScannedPage> get scannedPages => _scannedPages;

  int _activePageIndex = 0;
  int get activePageIndex => _activePageIndex;

  bool _isAddingPageFlow = false;
  bool get isAddingPageFlow => _isAddingPageFlow;

  ScannedPage? get activePage => _scannedPages.isNotEmpty && _activePageIndex < _scannedPages.length 
      ? _scannedPages[_activePageIndex] 
      : null;

  void setCapturedImageBytes(Uint8List bytes) {
    _capturedImageBytes = bytes;
    final newPage = ScannedPage(imageBytes: bytes);
    if (_isAddingPageFlow) {
      _scannedPages.add(newPage);
      _activePageIndex = _scannedPages.length - 1;
    } else {
      _scannedPages = [newPage];
      _activePageIndex = 0;
    }
    notifyListeners();
  }

  void clearCapturedImage() {
    _capturedImageBytes = null;
    _scannedPages.clear();
    _activePageIndex = 0;
    _isAddingPageFlow = false;
  }

  void selectPage(int index) {
    if (index >= 0 && index < _scannedPages.length) {
      _activePageIndex = index;
      notifyListeners();
    }
  }

  void removeScannedPage(int index) {
    if (index >= 0 && index < _scannedPages.length) {
      _scannedPages.removeAt(index);
      if (_activePageIndex >= _scannedPages.length) {
        _activePageIndex = _scannedPages.isEmpty ? 0 : _scannedPages.length - 1;
      }
      notifyListeners();
    }
  }

  void reorderScannedPages(int oldIndex, int newIndex) {
    if (oldIndex >= 0 && oldIndex < _scannedPages.length && newIndex >= 0 && newIndex < _scannedPages.length) {
      final page = _scannedPages.removeAt(oldIndex);
      _scannedPages.insert(newIndex, page);
      _activePageIndex = newIndex;
      notifyListeners();
    }
  }

  void updateActivePageCrop(Offset tl, Offset tr, Offset bl, Offset br) {
    if (_scannedPages.isNotEmpty && _activePageIndex < _scannedPages.length) {
      _scannedPages[_activePageIndex] = _scannedPages[_activePageIndex].copyWith(
        topLeft: tl,
        topRight: tr,
        bottomLeft: bl,
        bottomRight: br,
      );
      notifyListeners();
    }
  }

  void updateActivePageRotation(int rotationQuarters) {
    if (_scannedPages.isNotEmpty && _activePageIndex < _scannedPages.length) {
      _scannedPages[_activePageIndex] = _scannedPages[_activePageIndex].copyWith(
        rotationQuarters: rotationQuarters,
      );
      notifyListeners();
    }
  }

  void updateActivePageFilter(String filter, {bool applyToAll = false}) {
    if (_scannedPages.isEmpty) return;
    if (applyToAll) {
      for (int i = 0; i < _scannedPages.length; i++) {
        _scannedPages[i] = _scannedPages[i].copyWith(filter: filter);
      }
    } else {
      if (_activePageIndex < _scannedPages.length) {
        _scannedPages[_activePageIndex] = _scannedPages[_activePageIndex].copyWith(filter: filter);
      }
    }
    _scannedFilter = filter;
    notifyListeners();
  }

  // Navigation History Stack (simple pop/push for details screen, scanner etc.)
  final List<AppScreen> _history = [];

  void setScreen(AppScreen screen, {bool clearHistory = false}) {
    if (clearHistory) {
      _history.clear();
    } else {
      _history.add(_currentScreen);
    }
    _currentScreen = screen;
    notifyListeners();
  }

  void goBack() {
    if (_history.isNotEmpty) {
      _currentScreen = _history.removeLast();
      notifyListeners();
    } else {
      _currentScreen = AppScreen.dashboard;
      notifyListeners();
    }
  }

  // Document Operations & Getters
  List<Document> get homeDocuments {
    var allDocs = _service.getAllDocuments();
    
    // Filter by type chip
    if (_activeFilter != 'All') {
      allDocs = allDocs.where((doc) {
        final type = doc.fileType.toLowerCase();
        if (_activeFilter == 'PDF') return type == 'pdf';
        if (_activeFilter == 'Word') return type == 'docx';
        if (_activeFilter == 'Excel') return type == 'xlsx';
        if (_activeFilter == 'PPT') return type == 'pptx';
        return true;
      }).toList();
    }

    // Filter by Home Search Query & Folder Context
    if (_homeSearchQuery.isNotEmpty) {
      final q = _homeSearchQuery.toLowerCase();
      allDocs = allDocs.where((doc) => doc.title.toLowerCase().contains(q) || doc.author.toLowerCase().contains(q)).toList();
    } else {
      allDocs = allDocs.where((doc) => doc.parentFolderId == _currentFolderId).toList();
    }

    // Split folders and files to float folders to the top
    final folders = allDocs.where((d) => d.fileType == 'folder').toList();
    final files = allDocs.where((d) => d.fileType != 'folder').toList();

    // Sort folders (folders always sorted by name alphabetically or by date)
    if (_sortBy == 'name_desc') {
      folders.sort((a, b) => b.title.toLowerCase().compareTo(a.title.toLowerCase()));
    } else {
      folders.sort((a, b) => a.title.toLowerCase().compareTo(b.title.toLowerCase()));
    }

    // Sort files based on sort criteria
    switch (_sortBy) {
      case 'date_desc':
        files.sort((a, b) => _parseAddedDate(b.addedDate).compareTo(_parseAddedDate(a.addedDate)));
        break;
      case 'date_asc':
        files.sort((a, b) => _parseAddedDate(a.addedDate).compareTo(_parseAddedDate(b.addedDate)));
        break;
      case 'name_asc':
        files.sort((a, b) => a.title.toLowerCase().compareTo(b.title.toLowerCase()));
        break;
      case 'name_desc':
        files.sort((a, b) => b.title.toLowerCase().compareTo(a.title.toLowerCase()));
        break;
      case 'size_desc':
        files.sort((a, b) => _parseSize(b.size).compareTo(_parseSize(a.size)));
        break;
      case 'size_asc':
        files.sort((a, b) => _parseSize(a.size).compareTo(_parseSize(b.size)));
        break;
      default:
        files.sort((a, b) => _parseAddedDate(b.addedDate).compareTo(_parseAddedDate(a.addedDate)));
    }

    return [...folders, ...files];
  }

  // Folder & Sorting Helpers
  DateTime _parseAddedDate(String dateStr) {
    if (dateStr.contains('now') || dateStr.contains('Just')) {
      return DateTime.now();
    }
    if (dateStr.contains('min')) {
      final mins = int.tryParse(dateStr.replaceAll(RegExp(r'\D'), '')) ?? 0;
      return DateTime.now().subtract(Duration(minutes: mins));
    }
    if (dateStr.contains('hour')) {
      final hours = int.tryParse(dateStr.replaceAll(RegExp(r'\D'), '')) ?? 0;
      return DateTime.now().subtract(Duration(hours: hours));
    }
    final parts = dateStr.split('/');
    if (parts.length == 3) {
      final day = int.tryParse(parts[0]) ?? 1;
      final month = int.tryParse(parts[1]) ?? 1;
      final year = int.tryParse(parts[2]) ?? 2024;
      return DateTime(year, month, day);
    }
    return DateTime(2024, 1, 1);
  }

  double _parseSize(String sizeStr) {
    final clean = sizeStr.replaceAll(RegExp(r'[^\d\.]'), '').trim();
    final val = double.tryParse(clean) ?? 0.0;
    if (sizeStr.toLowerCase().contains('kb')) {
      return val / 1024.0;
    } else if (sizeStr.toLowerCase().contains('gb')) {
      return val * 1024.0;
    }
    return val;
  }

  void updateSortBy(String criteria) {
    _sortBy = criteria;
    notifyListeners();
  }

  void openFolder(String? folderId) {
    _currentFolderId = folderId;
    notifyListeners();
  }

  void closeCurrentFolder() {
    if (_currentFolderId == null) return;
    final folder = _service.getAllDocuments().firstWhere(
      (d) => d.id == _currentFolderId,
      orElse: () => Document(id: '', title: '', fileType: '', size: '', addedDate: ''),
    );
    _currentFolderId = folder.parentFolderId;
    notifyListeners();
  }

  List<Document> get folderPath {
    final path = <Document>[];
    String? tempId = _currentFolderId;
    while (tempId != null) {
      final folder = _service.getAllDocuments().firstWhere(
        (d) => d.id == tempId,
        orElse: () => Document(id: '', title: '', fileType: '', size: '', addedDate: ''),
      );
      if (folder.id.isNotEmpty) {
        path.insert(0, folder);
        tempId = folder.parentFolderId;
      } else {
        break;
      }
    }
    return path;
  }

  List<Document> get folders {
    return _service.getAllDocuments().where((d) => d.fileType == 'folder').toList();
  }

  int getAllFolderItemsCount(String folderId) {
    return _service.getAllDocuments().where((d) => d.parentFolderId == folderId).length;
  }

  void moveDocument(String id, String? targetFolderId) {
    _service.moveDocument(id, targetFolderId);
    if (_selectedDocument?.id == id) {
      _selectedDocument = _selectedDocument?.copyWith(
        parentFolderId: targetFolderId,
        clearParentFolder: targetFolderId == null,
      );
    }
    notifyListeners();
  }

  void copyDocument(String id, String? targetFolderId) {
    _service.copyDocument(id, targetFolderId);
    notifyListeners();
  }

  List<Document> get recentDocuments {
    var allDocs = _service.getAllDocuments();
    // In a real app we'd sort by last read/modified timestamp.
    // For demo, we just filter by query if set
    if (_recentSearchQuery.isNotEmpty) {
      final q = _recentSearchQuery.toLowerCase();
      allDocs = allDocs.where((doc) => doc.title.toLowerCase().contains(q) || doc.author.toLowerCase().contains(q)).toList();
    }
    return allDocs;
  }

  List<Document> get likedDocuments {
    var favDocs = _service.getAllDocuments().where((doc) => doc.isFavorite).toList();
    if (_likedSearchQuery.isNotEmpty) {
      final q = _likedSearchQuery.toLowerCase();
      favDocs = favDocs.where((doc) => doc.title.toLowerCase().contains(q) || doc.author.toLowerCase().contains(q)).toList();
    }
    return favDocs;
  }

  // All documents flat list (no folder filter, no type filter) — used by Files tab
  List<Document> get allDocuments {
    return _service.getAllDocuments();
  }

  // Main search screen result
  List<Document> get searchResults {
    return _service.searchDocuments(_searchQuery);
  }

  // Update setters
  void updateFilter(String filter) {
    _activeFilter = filter;
    notifyListeners();
  }

  void updateHomeSearch(String query) {
    _homeSearchQuery = query;
    notifyListeners();
  }

  void updateRecentSearch(String query) {
    _recentSearchQuery = query;
    notifyListeners();
  }

  void updateLikedSearch(String query) {
    _likedSearchQuery = query;
    notifyListeners();
  }

  void updateSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  void toggleFavorite(String id) {
    _service.toggleFavorite(id);
    notifyListeners();
  }

  void selectDocument(Document doc) {
    _selectedDocument = doc;
    if (doc.fileType.toLowerCase() == 'pdf' && doc.filePath != null) {
      _extractPdfDataInBackground(doc);
    }
  }

  Future<void> _extractPdfDataInBackground(Document doc) async {
    if (_documentTextCache.containsKey(doc.id)) return;

    try {
      final String? path = doc.filePath;
      if (path == null || path.isEmpty) return;

      Uint8List bytes;
      if (kIsWeb) {
        return;
      } else {
        final File file = File(path);
        if (!await file.exists()) return;
        bytes = await file.readAsBytes();
      }

      // Extract actual text using Syncfusion PDF
      final PdfDocument document = PdfDocument(inputBytes: bytes);
      final int actualPageCount = document.pages.count;
      
      final PdfTextExtractor extractor = PdfTextExtractor(document);
      final List<String> extractedPages = [];
      for (int i = 0; i < actualPageCount; i++) {
        String pageText = '';
        try {
          pageText = extractor.extractText(startPageIndex: i, endPageIndex: i);
        } catch (innerEx) {
          debugPrint('Error extracting text from page $i of PDF: $innerEx');
        }
        extractedPages.add(pageText);
      }
      document.dispose();

      _documentTextCache[doc.id] = extractedPages;
      
      // Update page count of the document if it doesn't match
      if (doc.pagesCount != actualPageCount) {
        final updatedDoc = doc.copyWith(pagesCount: actualPageCount);
        _service.updateDocument(updatedDoc);
        if (_selectedDocument?.id == doc.id) {
          _selectedDocument = updatedDoc;
        }
      }
      
      notifyListeners();
    } catch (e) {
      debugPrint('Error extracting PDF text: $e');
    }
  }

  void renameDocument(String id, String newTitle) {
    _service.renameDocument(id, newTitle);
    if (_selectedDocument?.id == id) {
      _selectedDocument = _selectedDocument?.copyWith(title: newTitle);
    }
    notifyListeners();
  }

  void deleteDocument(String id) {
    _service.removeDocument(id);
    if (_selectedDocument?.id == id) {
      _selectedDocument = null;
    }
    notifyListeners();
  }

  void restoreDocument(Document doc) {
    _service.addDocument(doc);
    notifyListeners();
  }

  // Create Mock Folder
  void createMockFolder(String folderName) {
    final newFolder = Document(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: folderName.endsWith('/') ? folderName : '$folderName/',
      fileType: 'folder',
      size: '0 items',
      addedDate: 'Just now',
      isFavorite: false,
      pagesCount: 0,
      author: 'PDFmount Reader',
      description: 'Folder for keeping documents organized.',
      parentFolderId: _currentFolderId,
    );
    _service.addDocument(newFolder);
    notifyListeners();
  }

  // Add Uploaded Document Simulation & Real support
  void addUploadedDocument(String fileName, String fileType, String fileSize, {String? filePath}) {
    String cleanType = fileType.replaceAll('.', '').toLowerCase();
    String suffix = fileType.startsWith('.') ? fileType : '.$fileType';
    String cleanName = fileName.endsWith(suffix) ? fileName : '$fileName$suffix';

    final newDoc = Document(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      title: cleanName,
      fileType: cleanType,
      size: fileSize,
      addedDate: 'Just now',
      isFavorite: false,
      pagesCount: 5,
      author: 'PDFmount User',
      description: 'Uploaded document file.',
      filePath: filePath,
      parentFolderId: _currentFolderId,
    );
    _service.addDocument(newDoc);
    notifyListeners();
  }

  /// Adds a real file picked from storage into the local document workspace.
  Future<Document?> addRealDocument(PlatformFile platformFile) async {
    try {
      String savedPath;
      if (kIsWeb) {
        savedPath = 'web_upload/${platformFile.name}';
      } else {
        final docDir = await getApplicationDocumentsDirectory();
        final dirPath = p.join(docDir.path, 'uploaded_pdfs');
        await Directory(dirPath).create(recursive: true);
        
        final localFile = File(p.join(dirPath, platformFile.name));
        if (platformFile.bytes != null) {
          await localFile.writeAsBytes(platformFile.bytes!);
        } else if (platformFile.path != null) {
          await File(platformFile.path!).copy(localFile.path);
        }
        savedPath = localFile.path;
      }

      final sizeStr = _formatBytes(platformFile.size);

      final newDoc = Document(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: platformFile.name,
        fileType: platformFile.name.split('.').last.toLowerCase(),
        size: sizeStr,
        addedDate: 'Just now',
        isFavorite: false,
        pagesCount: 1,
        author: 'Local User',
        description: 'Uploaded from device storage.',
        filePath: savedPath,
        parentFolderId: _currentFolderId,
      );

      _service.addDocument(newDoc);
      notifyListeners();
      return newDoc;
    } catch (e) {
      debugPrint('Error adding real document: $e');
      return null;
    }
  }

  /// Calls the Rust backend engine via ApiService to process the specified PDF tool
  /// and automatically adds the resulting document to the active folder workspace.
  Future<Document?> processTool(String toolId, List<PlatformFile> files, Map<String, dynamic> options) async {
    final timestamp = DateTime.now();
    final jobId = 'job_${timestamp.millisecondsSinceEpoch}';
    final placeholderId = 'proc_${timestamp.millisecondsSinceEpoch}';
    final toolDisplay = toolId.replaceAll('-', ' ').replaceAll('_', ' ').toUpperCase();

    // 1. Add active job tracking item
    final activeJob = ActiveJob(
      id: jobId,
      toolId: toolId,
      status: 'processing',
      timestamp: timestamp,
      details: 'Processing ${files.length} file(s) on backend...',
    );
    _activeJobs.insert(0, activeJob);

    // 2. Add placeholder in-progress document to recent files list
    final placeholderDoc = Document(
      id: placeholderId,
      title: 'Generating $toolDisplay output...',
      fileType: 'pdf',
      size: 'Processing...',
      addedDate: 'Just now',
      isFavorite: false,
      isProcessing: true,
      author: 'PDFmount Engine',
      description: 'Running $toolDisplay...',
      parentFolderId: _currentFolderId,
    );
    _service.addDocument(placeholderDoc);
    notifyListeners();

    try {
      final Map<String, dynamic> result;
      if (OfflineEngineManager.isOfflineCapable(toolId)) {
        result = await OfflineEngineManager.runOfflineTool(
          toolId: toolId,
          files: files,
          options: options,
        );
      } else {
        result = await ApiService.runPdfTool(
          toolId: toolId,
          files: files,
          options: options,
        );
      }

      // 3. Remove placeholder and active job
      _service.removeDocument(placeholderId);
      final jobIndex = _activeJobs.indexWhere((j) => j.id == jobId);
      if (jobIndex != -1) {
        _activeJobs[jobIndex] = ActiveJob(
          id: jobId,
          toolId: toolId,
          status: 'completed',
          timestamp: DateTime.now(),
          details: 'Successfully generated ${result['fileName']}',
        );
      }

      final newDoc = Document(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: result['fileName'],
        fileType: (result['fileName'] as String).split('.').last.toLowerCase(),
        size: result['fileSize'],
        addedDate: 'Just now',
        isFavorite: false,
        pagesCount: result['pagesCount'] as int? ?? 1,
        author: 'PDFmount Engine',
        description: result['sourceImagePaths'] != null && (result['sourceImagePaths'] as List).isNotEmpty
            ? 'image_paths:${(result['sourceImagePaths'] as List).join(',')}'
            : 'Result of processing tool $toolId.',
        filePath: result['filePath'],
        parentFolderId: _currentFolderId,
      );

      final cleanId = toolId.toLowerCase().replaceAll('_', '-').trim();
      List<dynamic>? inheritedImages;

      if (cleanId == 'merge-pdf' || cleanId == 'merge') {
        final List<dynamic> combinedImages = [];
        for (final file in files) {
          final matchedDoc = _service.getAllDocuments().firstWhere(
            (d) => d.title == file.name,
            orElse: () => Document(id: '', title: '', fileType: '', size: '', addedDate: ''),
          );
          if (matchedDoc.id.isNotEmpty) {
            final cached = getDocumentImages(matchedDoc.id);
            if (cached != null) {
              combinedImages.addAll(cached);
            }
          }
        }
        if (combinedImages.isNotEmpty) {
          inheritedImages = combinedImages;
        }
      } else if (cleanId == 'split-pdf' || cleanId == 'split') {
        if (files.isNotEmpty) {
          final file = files.first;
          final matchedDoc = _service.getAllDocuments().firstWhere(
            (d) => d.title == file.name,
            orElse: () => Document(id: '', title: '', fileType: '', size: '', addedDate: ''),
          );
          if (matchedDoc.id.isNotEmpty) {
            final cached = getDocumentImages(matchedDoc.id);
            if (cached != null) {
              final rangeStr = options['pageRange'] as String? ?? '1';
              final indices = _parsePageRange(rangeStr, cached.length);
              final List<dynamic> splitImages = [];
              for (final index in indices) {
                if (index >= 0 && index < cached.length) {
                  splitImages.add(cached[index]);
                }
              }
              if (splitImages.isNotEmpty) {
                inheritedImages = splitImages;
              }
            }
          }
        }
      } else if (files.isNotEmpty) {
        // Protect, Unlock, Watermark, Sign: copy the source cache
        final file = files.first;
        final matchedDoc = _service.getAllDocuments().firstWhere(
          (d) => d.title == file.name,
          orElse: () => Document(id: '', title: '', fileType: '', size: '', addedDate: ''),
        );
        if (matchedDoc.id.isNotEmpty) {
          final cached = getDocumentImages(matchedDoc.id);
          if (cached != null) {
            inheritedImages = List.from(cached);
          }
        }
      }

      if (inheritedImages != null && inheritedImages.isNotEmpty) {
        _documentImageCache[newDoc.id] = inheritedImages;
      } else if (result['sourceImageBytes'] != null && (result['sourceImageBytes'] as List).isNotEmpty) {
        _documentImageCache[newDoc.id] = result['sourceImageBytes'] as List;
      } else if (result['sourceImagePaths'] != null && (result['sourceImagePaths'] as List).isNotEmpty) {
        _documentImageCache[newDoc.id] = result['sourceImagePaths'] as List;
      }

      _service.addDocument(newDoc);
      notifyListeners();
      return newDoc;
    } catch (e) {
      debugPrint('Error running PDF tool: $e');
      
      // 4. Update status to failed
      _service.removeDocument(placeholderId);
      final jobIndex = _activeJobs.indexWhere((j) => j.id == jobId);
      if (jobIndex != -1) {
        _activeJobs[jobIndex] = ActiveJob(
          id: jobId,
          toolId: toolId,
          status: 'failed',
          timestamp: DateTime.now(),
          details: e.toString().replaceAll('Exception: ', ''),
        );
      }
      notifyListeners();
      rethrow;
    }
  }

  static String _formatBytes(int bytes) {
    if (bytes <= 0) return '0 Bytes';
    const suffixes = ['Bytes', 'KB', 'MB', 'GB'];
    double size = bytes.toDouble();
    int index = 0;
    while (size >= 1024 && index < suffixes.length - 1) {
      size /= 1024;
      index++;
    }
    return '${size.toStringAsFixed(1)} ${suffixes[index]}';
  }

  Future<void> startScanFlow(BuildContext context, {bool isAddingPage = false}) async {
    _isAddingPageFlow = isAddingPage;
    if (!isAddingPage) {
      _scannedTitle = 'Doc_${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}.pdf';
      _scannedFilter = 'Original';
      _scannedPages.clear();
      _capturedImageBytes = null;
      _activePageIndex = 0;
    }

    if (kIsWeb) {
      await _pickWebFallbackImages();
      return;
    }

    try {
      final scanner = DocumentScanner(
        options: DocumentScannerOptions(
          documentFormat: DocumentFormat.jpeg,
          mode: ScannerMode.full,
          pageLimit: 100,
          isGalleryImport: true,
        ),
      );

      final DocumentScanningResult result = await scanner.scanDocument();
      scanner.close();

      if (result.images.isNotEmpty) {
        final List<Uint8List> pagesBytes = [];
        for (final String path in result.images) {
          final file = File(path);
          if (await file.exists()) {
            final bytes = await file.readAsBytes();
            pagesBytes.add(bytes);
          }
        }

        if (pagesBytes.isNotEmpty) {
          if (_isAddingPageFlow) {
            _scannedPages.addAll(pagesBytes.map((bytes) => ScannedPage(imageBytes: bytes)));
            _activePageIndex = _scannedPages.length - 1;
          } else {
            _scannedPages = pagesBytes.map((bytes) => ScannedPage(imageBytes: bytes)).toList();
            _activePageIndex = 0;
          }
          notifyListeners();
          setScreen(AppScreen.scanPreview);
        }
      }
    } catch (e) {
      debugPrint("Error running Google ML Kit Scanner: $e");
      await _pickWebFallbackImages();
    }
  }

  Future<void> _pickWebFallbackImages() async {
    try {
      final picker = ImagePicker();
      final List<XFile> images = await picker.pickMultiImage(imageQuality: 90);
      if (images.isNotEmpty) {
        final List<Uint8List> pagesBytes = [];
        for (final img in images) {
          final bytes = await img.readAsBytes();
          pagesBytes.add(bytes);
        }
        
        if (pagesBytes.isNotEmpty) {
          if (_isAddingPageFlow) {
            _scannedPages.addAll(pagesBytes.map((bytes) => ScannedPage(imageBytes: bytes)));
            _activePageIndex = _scannedPages.length - 1;
          } else {
            _scannedPages = pagesBytes.map((bytes) => ScannedPage(imageBytes: bytes)).toList();
            _activePageIndex = 0;
          }
          notifyListeners();
          setScreen(AppScreen.scanPreview);
        }
      }
    } catch (e) {
      debugPrint("Error in web/gallery multi-image pick: $e");
    }
  }




  final List<Uint8List> _imagesToPdf = [];
  List<Uint8List> get imagesToPdf => _imagesToPdf;

  Future<void> startImageToPdfFlow(BuildContext context) async {
    _imagesToPdf.clear();
    notifyListeners();
    await _showImagesToPdfSheet(context);
  }

  Future<void> _showImagesToPdfSheet(BuildContext context) async {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => _ImagesToPdfSheet(isDark: isDark, theme: theme, appState: this),
    );
  }

  Future<List<Uint8List>> pickMultipleImages() async {
    final picker = ImagePicker();
    List<Uint8List> results = [];
    try {
      final List<XFile> images = await picker.pickMultiImage(imageQuality: 90);
      for (final img in images) {
        final bytes = await img.readAsBytes();
        results.add(bytes);
      }
    } catch (e) {
      debugPrint('Error picking multiple images: $e');
    }
    return results;
  }

  Future<void> saveImagesToPdf(List<Uint8List> images, String name) async {
    if (images.isEmpty) return;

    final newDocId = DateTime.now().millisecondsSinceEpoch.toString();
    final cleanTitle = name.endsWith('.pdf') ? name : '$name.pdf';

    // Create temporary PlatformFiles from selected images
    final List<PlatformFile> tempFiles = [];
    for (int i = 0; i < images.length; i++) {
      tempFiles.add(PlatformFile(
        name: 'image_$i.png',
        size: images[i].length,
        bytes: images[i],
      ));
    }

    String? savedFilePath;
    try {
      final result = await OfflineEngineManager.runOfflineTool(
        toolId: 'jpg-to-pdf',
        files: tempFiles,
        options: {
          'pageOrientation': 'portrait',
          'pageSize': 'a4',
          'pageMargin': 'none',
          'outputName': cleanTitle,
        },
      );
      savedFilePath = result['filePath'];

      // Cache the original images for instant preview
      _documentImageCache[newDocId] = images;

    } catch (e) {
      debugPrint("Error compiling selected images to PDF: $e");
    }

    final doc = Document(
      id: newDocId,
      title: cleanTitle,
      fileType: 'pdf',
      size: savedFilePath != null 
          ? '${(images.length * 1.2).toStringAsFixed(1)} MB' 
          : '0.0 Bytes',
      addedDate: 'Just now',
      isFavorite: false,
      pagesCount: images.length,
      author: 'StitchPDF',
      description: 'Compiled from ${images.length} image(s).',
      filePath: savedFilePath,
      parentFolderId: _currentFolderId,
    );
    _service.addDocument(doc);
    _selectedDocument = doc;
    notifyListeners();
  }


  void updateScannedTitle(String title) {
    _scannedTitle = title;
    notifyListeners();
  }

  void updateScannedFilter(String filter) {
    _scannedFilter = filter;
    notifyListeners();
  }

  Future<void> saveScannedDocument() async {
    String? savedFilePath;
    int pagesCount = _scannedPages.isNotEmpty ? _scannedPages.length : 1;
    final newDocId = DateTime.now().millisecondsSinceEpoch.toString();

    // Create temporary PlatformFiles from scanned pages or captured image
    final List<PlatformFile> tempFiles = [];

    if (_scannedPages.isNotEmpty) {
      for (int i = 0; i < _scannedPages.length; i++) {
        tempFiles.add(PlatformFile(
          name: 'scanned_page_$i.png',
          size: _scannedPages[i].imageBytes.length,
          bytes: _scannedPages[i].imageBytes,
        ));
      }
    } else if (_capturedImageBytes != null) {
      tempFiles.add(PlatformFile(
        name: 'captured_page.png',
        size: _capturedImageBytes!.length,
        bytes: _capturedImageBytes,
      ));
    }

    if (tempFiles.isNotEmpty) {
      try {
        final cleanTitle = _scannedTitle.endsWith('.pdf') ? _scannedTitle : '$_scannedTitle.pdf';
        
        // Use OfflineEngineManager to compile to a real PDF in real-time!
        final result = await OfflineEngineManager.runOfflineTool(
          toolId: 'jpg-to-pdf',
          files: tempFiles,
          options: {
            'pageOrientation': 'portrait',
            'pageSize': 'a4',
            'pageMargin': 'none',
            'outputName': cleanTitle,
          },
        );
        savedFilePath = result['filePath'];

        // Store the original images in memory cache for instant preview
        final List<Uint8List> cachedBytes = tempFiles.map((f) => f.bytes!).toList();
        _documentImageCache[newDocId] = cachedBytes;

      } catch (e) {
        debugPrint("Error creating PDF from scanned pages: $e");
        // Fallback: save first page as image if compiler fails
        try {
          if (kIsWeb) {
            savedFilePath = 'web_upload/doc_${newDocId}_fallback.png';
          } else {
            final directory = await getApplicationDocumentsDirectory();
            final filename = 'doc_${newDocId}_fallback.png';
            final file = File(p.join(directory.path, filename));
            if (_scannedPages.isNotEmpty) {
              await file.writeAsBytes(_scannedPages.first.imageBytes);
            } else if (_capturedImageBytes != null) {
              await file.writeAsBytes(_capturedImageBytes!);
            }
            savedFilePath = file.path;
          }
        } catch (innerEx) {
          debugPrint("Fallback save failed: $innerEx");
        }
      }
    }

    final newDoc = Document(
      id: newDocId,
      title: _scannedTitle.endsWith('.pdf') ? _scannedTitle : '$_scannedTitle.pdf',
      fileType: 'pdf',
      size: '${(pagesCount * 1.4).toStringAsFixed(1)} MB',
      addedDate: 'Just now',
      isFavorite: false,
      pagesCount: pagesCount,
      author: 'Scanner App',
      description: 'Document scanned and compiled to PDF.',
      filePath: savedFilePath,
      parentFolderId: _currentFolderId,
    );
    _service.addDocument(newDoc);
    _selectedDocument = newDoc;
    clearCapturedImage();
    setScreen(AppScreen.dashboard, clearHistory: true);
  }

  // Search History State
  List<String> _searchHistory = ['invoice', 'contract', 'report'];
  List<String> get searchHistory => _searchHistory;

  void addToSearchHistory(String query) {
    final trimmed = query.trim();
    if (trimmed.isEmpty) return;
    _searchHistory.remove(trimmed);
    _searchHistory.insert(0, trimmed);
    if (_searchHistory.length > 5) {
      _searchHistory = _searchHistory.sublist(0, 5);
    }
    notifyListeners();
  }

  void clearSearchHistory() {
    _searchHistory.clear();
    notifyListeners();
  }

  // Theme Management
  void toggleTheme() {
    if (_themeMode == ThemeMode.system) {
      final brightness = WidgetsBinding.instance.platformDispatcher.platformBrightness;
      _themeMode = brightness == Brightness.dark ? ThemeMode.light : ThemeMode.dark;
    } else {
      _themeMode = _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    }
    notifyListeners();
  }

  // Parse page range helper for cache slicing
  List<int> _parsePageRange(String rangeStr, int totalPages) {
    final List<int> pages = [];
    final cleanStr = rangeStr.replaceAll(RegExp(r'\s+'), '');
    final parts = cleanStr.split(',');

    for (final part in parts) {
      if (part.contains('-')) {
        final subParts = part.split('-');
        if (subParts.length == 2) {
          final start = int.tryParse(subParts[0]);
          final end = int.tryParse(subParts[1]);
          if (start != null && end != null) {
            final s = start.clamp(1, totalPages);
            final e = end.clamp(1, totalPages);
            final low = s < e ? s : e;
            final high = s < e ? e : s;
            for (int i = low; i <= high; i++) {
              pages.add(i - 1);
            }
          }
        }
      } else {
        final val = int.tryParse(part);
        if (val != null) {
          final p = val.clamp(1, totalPages);
          pages.add(p - 1);
        }
      }
    }
    return pages.toSet().toList();
  }
}

// ── Images to PDF Bottom Sheet Widget ──────────────────────────────────────────

class _ImagesToPdfSheet extends StatefulWidget {
  final bool isDark;
  final ThemeData theme;
  final AppState appState;

  const _ImagesToPdfSheet({
    required this.isDark,
    required this.theme,
    required this.appState,
  });

  @override
  State<_ImagesToPdfSheet> createState() => _ImagesToPdfSheetState();
}

class _ImagesToPdfSheetState extends State<_ImagesToPdfSheet> {
  List<Uint8List> _selectedImages = [];
  final TextEditingController _nameController = TextEditingController(text: 'Scanned_Images');
  bool _isLoading = false;
  bool _isSaved = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    final images = await widget.appState.pickMultipleImages();
    if (images.isNotEmpty) {
      setState(() => _selectedImages = images);
    }
  }

  Future<void> _save() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 800));
    await widget.appState.saveImagesToPdf(_selectedImages, _nameController.text);
    setState(() {
      _isLoading = false;
      _isSaved = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = widget.theme;
    final isDark = widget.isDark;
    final textStyle = TextStyle(color: theme.colorScheme.onSurface);

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTokens.radiusXl)),
      ),
      padding: EdgeInsets.only(
        left: AppTokens.containerPadding,
        right: AppTokens.containerPadding,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppTokens.containerPadding,
        top: AppTokens.containerPadding,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 40,
              height: 5,
              decoration: BoxDecoration(
                color: theme.colorScheme.outlineVariant,
                borderRadius: BorderRadius.circular(2.5),
              ),
            ),
          ),
          const SizedBox(height: AppTokens.stackLg),

          // Header
          Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: theme.colorScheme.error.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.photo_library_rounded, color: theme.colorScheme.error, size: 22),
              ),
              const SizedBox(width: AppTokens.gutter),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Images to PDF',
                    style: theme.textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  Text(
                    'Select images and save as PDF',
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: AppTokens.stackLg),

          if (_isSaved) ...[
            Icon(Icons.check_circle_rounded, color: theme.colorScheme.error, size: 56),
            const SizedBox(height: AppTokens.gutter),
            Text(
              'Saved as PDF!',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: theme.colorScheme.error,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTokens.radiusDefault)),
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text('Done'),
            ),
          ] else if (_isLoading) ...[
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: AppTokens.gutter),
            Text('Compiling images...', textAlign: TextAlign.center, style: textStyle),
          ] else ...[
            // Image count badge
            if (_selectedImages.isNotEmpty)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: theme.colorScheme.error.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(AppTokens.radiusDefault),
                  border: Border.all(color: theme.colorScheme.error.withOpacity(0.25)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.image_rounded, color: theme.colorScheme.error, size: 20),
                    const SizedBox(width: 10),
                    Text(
                      '${_selectedImages.length} image${_selectedImages.length == 1 ? '' : 's'} selected',
                      style: TextStyle(
                        color: theme.colorScheme.error,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: _pickImages,
                      child: Text(
                        'Change',
                        style: TextStyle(
                          color: theme.colorScheme.onSurfaceVariant,
                          fontSize: 13,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            if (_selectedImages.isEmpty) ...[
              // Pick images button (primary action when no images selected)
              ElevatedButton.icon(
                icon: const Icon(Icons.add_photo_alternate_rounded),
                label: const Text('Select Images from Gallery'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: isDark ? const Color(0xFF282828) : const Color(0xFFF5F5F5),
                  foregroundColor: theme.colorScheme.onSurface,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTokens.radiusDefault)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: _pickImages,
              ),
            ] else ...[
              const SizedBox(height: AppTokens.gutter),
              // File name field
              TextField(
                controller: _nameController,
                style: textStyle,
                decoration: InputDecoration(
                  labelText: 'PDF File Name',
                  labelStyle: TextStyle(color: theme.colorScheme.onSurfaceVariant),
                  prefixIcon: Icon(Icons.description_rounded, color: theme.colorScheme.onSurfaceVariant),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppTokens.radiusDefault),
                  ),
                ),
              ),
              const SizedBox(height: AppTokens.stackLg),
              // Save button
              ElevatedButton.icon(
                icon: const Icon(Icons.picture_as_pdf_rounded),
                label: const Text('Save as PDF'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: theme.colorScheme.error,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTokens.radiusDefault)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: _nameController.text.isEmpty ? null : _save,
              ),
            ],
          ],

          const SizedBox(height: AppTokens.gutter),
        ],
      ),
    );
  }
}
