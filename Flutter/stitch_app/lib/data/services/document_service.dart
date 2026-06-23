import 'dart:convert';
import 'package:flutter/foundation.dart' show debugPrint;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/document.dart';

class DocumentService {
  final List<Document> _documents = [
    Document(
      id: '1',
      title: 'Q3 Finance Report.pdf',
      fileType: 'pdf',
      size: '14.8 MB',
      addedDate: '12 mins ago',
      isFavorite: false,
      pagesCount: 12,
      author: 'Finance Admin',
      description: 'Q3 corporate quarterly financial status, performance metrics, and growth forecasts.',
    ),
    Document(
      id: '2',
      title: 'Wedding invitation.pdf',
      fileType: 'pdf',
      size: '5.2 MB',
      addedDate: '02/03/2024',
      isFavorite: true,
      pagesCount: 2,
      author: 'Sarah & Alex',
      description: 'Elegant custom wedding invitation card and event itinerary details.',
    ),
    Document(
      id: '3',
      title: 'Project Proposal_v2.docx',
      fileType: 'docx',
      size: '1.1 MB',
      addedDate: '01/03/2024',
      isFavorite: false,
      pagesCount: 8,
      author: 'Lead Architect',
      description: 'System architecture design proposal and project scoping documentation.',
    ),
    Document(
      id: '4',
      title: 'Bank Statement Feb.pdf',
      fileType: 'pdf',
      size: '2.4 MB',
      addedDate: '28/02/2024',
      isFavorite: false,
      pagesCount: 4,
      author: 'PDFmount Bank Corp',
      description: 'Monthly checking and savings account statement details for February.',
    ),
    Document(
      id: '5',
      title: 'Inventory_Sheet.xlsx',
      fileType: 'xlsx',
      size: '850 KB',
      addedDate: '25/02/2024',
      isFavorite: false,
      pagesCount: 1,
      author: 'Store Manager',
      description: 'Comprehensive list of retail items, quantities, and pricing database.',
    ),
    Document(
      id: '6',
      title: 'Product Pitch Presentation.pptx',
      fileType: 'pptx',
      size: '18.2 MB',
      addedDate: '20/02/2024',
      isFavorite: true,
      pagesCount: 25,
      author: 'Marketing Team',
      description: 'Slide deck outlining product roadmap, marketing strategy, and pitch parameters.',
    ),
  ];

  bool _isInitialized = false;

  Future<void> initLocalData() async {
    if (_isInitialized) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final content = prefs.getString('documents_db');
      if (content != null && content.isNotEmpty) {
        final List<dynamic> jsonList = jsonDecode(content);
        final loadedDocs = jsonList.map((j) => Document.fromJson(j)).toList();
        _documents.clear();
        _documents.addAll(loadedDocs);
      } else {
        await _saveToLocal();
      }
      _isInitialized = true;
    } catch (e) {
      debugPrint("Error loading document database: $e");
    }
  }

  Future<void> _saveToLocal() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonString = jsonEncode(_documents.map((d) => d.toJson()).toList());
      await prefs.setString('documents_db', jsonString);
    } catch (e) {
      debugPrint("Error saving document database: $e");
    }
  }

  List<Document> getAllDocuments() {
    return List.unmodifiable(_documents);
  }

  List<Document> searchDocuments(String query) {
    if (query.isEmpty) return getAllDocuments();
    final lowerQuery = query.toLowerCase();
    return _documents.where((doc) {
      return doc.title.toLowerCase().contains(lowerQuery) ||
          doc.fileType.toLowerCase().contains(lowerQuery) ||
          doc.author.toLowerCase().contains(lowerQuery);
    }).toList();
  }

  void addDocument(Document doc) {
    _documents.insert(0, doc);
    _saveToLocal();
  }

  void removeDocument(String id) {
    final index = _documents.indexWhere((doc) => doc.id == id);
    if (index != -1) {
      final doc = _documents[index];
      _documents.removeAt(index);
      if (doc.fileType == 'folder') {
        _deleteContentsOfFolder(id);
      }
      _saveToLocal();
    }
  }

  void _deleteContentsOfFolder(String folderId) {
    final toRemove = _documents.where((d) => d.parentFolderId == folderId).toList();
    for (final doc in toRemove) {
      _documents.removeWhere((d) => d.id == doc.id);
      if (doc.fileType == 'folder') {
        _deleteContentsOfFolder(doc.id);
      }
    }
  }

  void moveDocument(String id, String? targetFolderId) {
    final index = _documents.indexWhere((doc) => doc.id == id);
    if (index != -1) {
      _documents[index] = _documents[index].copyWith(
        parentFolderId: targetFolderId,
        clearParentFolder: targetFolderId == null,
      );
      _saveToLocal();
    }
  }

  void copyDocument(String id, String? targetFolderId) {
    final index = _documents.indexWhere((doc) => doc.id == id);
    if (index != -1) {
      final doc = _documents[index];
      final newDoc = doc.copyWith(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: doc.title.startsWith('Copy of ') ? doc.title : 'Copy of ${doc.title}',
        parentFolderId: targetFolderId,
        clearParentFolder: targetFolderId == null,
      );
      _documents.insert(0, newDoc);
      _saveToLocal();
    }
  }

  void renameDocument(String id, String newTitle) {
    final index = _documents.indexWhere((doc) => doc.id == id);
    if (index != -1) {
      _documents[index] = _documents[index].copyWith(title: newTitle);
      _saveToLocal();
    }
  }

  void toggleFavorite(String id) {
    final index = _documents.indexWhere((doc) => doc.id == id);
    if (index != -1) {
      _documents[index] = _documents[index].copyWith(
        isFavorite: !_documents[index].isFavorite,
      );
      _saveToLocal();
    }
  }
}
