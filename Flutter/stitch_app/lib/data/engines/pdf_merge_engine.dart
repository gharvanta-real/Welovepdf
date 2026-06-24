import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/painting.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';

class PdfMergeEngine {
  static Future<Uint8List> merge({
    required List<PlatformFile> files,
  }) async {
    if (files.isEmpty) {
      throw Exception('No files selected for merging.');
    }

    final PdfDocument mergedDocument = PdfDocument();

    try {
      for (final file in files) {
        Uint8List bytes;
        if (file.bytes != null) {
          bytes = file.bytes!;
        } else if (!kIsWeb && file.path != null) {
          bytes = await File(file.path!).readAsBytes();
        } else {
          throw Exception('File data is missing for ${file.name}.');
        }

        final PdfDocument loadedDocument = PdfDocument(inputBytes: bytes);
        for (int i = 0; i < loadedDocument.pages.count; i++) {
          final PdfPage loadedPage = loadedDocument.pages[i];
          final PdfTemplate template = loadedPage.createTemplate();
          mergedDocument.pageSettings.size = loadedPage.size;
          mergedDocument.pageSettings.margins.all = 0;
          final PdfPage newPage = mergedDocument.pages.add();
          newPage.graphics.drawPdfTemplate(template, Offset.zero);
        }
        loadedDocument.dispose();
      }

      final List<int> outBytes = await mergedDocument.save();
      return Uint8List.fromList(outBytes);
    } finally {
      mergedDocument.dispose();
    }
  }
}
