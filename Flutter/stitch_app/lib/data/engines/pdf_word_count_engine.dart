import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:syncfusion_flutter_pdf/pdf.dart';

class PdfWordCountEngine {
  static Future<Map<String, dynamic>> count({
    required PlatformFile file,
  }) async {
    Uint8List bytes;
    if (file.bytes != null) {
      bytes = file.bytes!;
    } else if (!kIsWeb && file.path != null) {
      bytes = await File(file.path!).readAsBytes();
    } else {
      throw Exception('File data is missing for ${file.name}.');
    }

    final PdfDocument document = PdfDocument(inputBytes: bytes);

    try {
      final PdfTextExtractor extractor = PdfTextExtractor(document);
      final String extractedText = extractor.extractText();

      final charCount = extractedText.length;
      final charCountNoSpaces = extractedText.replaceAll(RegExp(r'\s+'), '').length;

      // Split by whitespace to count words
      final words = extractedText.split(RegExp(r'\s+')).where((w) => w.isNotEmpty).toList();
      final wordCount = words.length;

      // Simple sentence count split by sentence ending punctuation
      final sentences = extractedText.split(RegExp(r'[.!?]+')).where((s) => s.trim().isNotEmpty).toList();
      final sentenceCount = sentences.length;

      // Lines count
      final lines = extractedText.split('\n').where((l) => l.trim().isNotEmpty).toList();
      final lineCount = lines.length;

      // Pages count
      final pageCount = document.pages.count;

      return {
        'wordCount': wordCount,
        'characterCount': charCount,
        'characterCountNoSpaces': charCountNoSpaces,
        'sentenceCount': sentenceCount,
        'lineCount': lineCount,
        'pageCount': pageCount,
        'text': extractedText,
      };
    } finally {
      document.dispose();
    }
  }
}
