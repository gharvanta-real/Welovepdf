import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/painting.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';

class PdfSplitEngine {
  static Future<Uint8List> split({
    required PlatformFile file,
    required String pageRange, // e.g., "1-3, 5, 7-10"
  }) async {
    Uint8List bytes;
    if (file.bytes != null) {
      bytes = file.bytes!;
    } else if (!kIsWeb && file.path != null) {
      bytes = await File(file.path!).readAsBytes();
    } else {
      throw Exception('File data is missing for ${file.name}.');
    }

    final PdfDocument loadedDocument = PdfDocument(inputBytes: bytes);
    final PdfDocument splitDocument = PdfDocument();

    try {
      final pageIndices = _parsePageRange(pageRange, loadedDocument.pages.count);
      if (pageIndices.isEmpty) {
        throw Exception('Invalid page range specified.');
      }

      for (final index in pageIndices) {
        final PdfPage loadedPage = loadedDocument.pages[index];
        final PdfTemplate template = loadedPage.createTemplate();
        splitDocument.pageSettings.size = loadedPage.size;
        splitDocument.pageSettings.margins.all = 0;
        final PdfPage newPage = splitDocument.pages.add();
        newPage.graphics.drawPdfTemplate(template, Offset.zero);
      }

      final List<int> outBytes = await splitDocument.save();
      return Uint8List.fromList(outBytes);
    } finally {
      loadedDocument.dispose();
      splitDocument.dispose();
    }
  }

  static List<int> _parsePageRange(String rangeStr, int totalPages) {
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
            final int minPage = start < end ? start : end;
            final int maxPage = start < end ? end : start;
            for (int i = minPage; i <= maxPage; i++) {
              // Convert to 0-indexed and bounds check
              final idx = i - 1;
              if (idx >= 0 && idx < totalPages) {
                pages.add(idx);
              }
            }
          }
        }
      } else {
        final val = int.tryParse(part);
        if (val != null) {
          final idx = val - 1;
          if (idx >= 0 && idx < totalPages) {
            pages.add(idx);
          }
        }
      }
    }
    // Remove duplicates and sort
    return pages.toSet().toList()..sort();
  }
}
