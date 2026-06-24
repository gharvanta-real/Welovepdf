import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/painting.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';

class PdfUnlockEngine {
  static Future<Uint8List> unlock({
    required PlatformFile file,
    required String password,
  }) async {
    Uint8List bytes;
    if (file.bytes != null) {
      bytes = file.bytes!;
    } else if (!kIsWeb && file.path != null) {
      bytes = await File(file.path!).readAsBytes();
    } else {
      throw Exception('File data is missing for ${file.name}.');
    }

    // Try loading the encrypted PDF using the password
    PdfDocument loadedDoc;
    try {
      loadedDoc = PdfDocument(inputBytes: bytes, password: password);
    } catch (e) {
      throw Exception('Incorrect password or invalid PDF format: $e');
    }

    final PdfDocument unlockedDocument = PdfDocument();

    try {
      for (int i = 0; i < loadedDoc.pages.count; i++) {
        final PdfPage loadedPage = loadedDoc.pages[i];
        final PdfTemplate template = loadedPage.createTemplate();
        unlockedDocument.pageSettings.size = loadedPage.size;
        unlockedDocument.pageSettings.margins.all = 0;
        final PdfPage newPage = unlockedDocument.pages.add();
        newPage.graphics.drawPdfTemplate(template, Offset.zero);
      }
      final List<int> outBytes = await unlockedDocument.save();
      return Uint8List.fromList(outBytes);
    } finally {
      loadedDoc.dispose();
      unlockedDocument.dispose();
    }
  }
}
