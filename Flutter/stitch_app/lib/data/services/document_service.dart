import 'dart:convert';
import 'package:flutter/foundation.dart' show debugPrint;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/document.dart';

class DocumentService {
  final List<Document> _documents = [];

  bool _isInitialized = false;

  Future<void> initLocalData() async {
    if (_isInitialized) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Wipe old mock documents database once
      final clearedMock = prefs.getBool('mock_docs_cleared_v1') ?? false;
      if (!clearedMock) {
        await prefs.remove('documents_db');
        await prefs.setBool('mock_docs_cleared_v1', true);
      }

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

  void updateDocument(Document doc) {
    final index = _documents.indexWhere((d) => d.id == doc.id);
    if (index != -1) {
      _documents[index] = doc;
      _saveToLocal();
    }
  }
}
