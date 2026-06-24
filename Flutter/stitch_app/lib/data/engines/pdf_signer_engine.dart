import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'package:flutter/painting.dart';

class PdfSignerEngine {
  static Future<Uint8List> sign({
    required PlatformFile pdfFile,
    required PlatformFile signatureImageFile,
    required int pageIndex, // 0-indexed
    required double x,
    required double y,
    required double width,
    required double height,
  }) async {
    Uint8List pdfBytes;
    if (pdfFile.bytes != null) {
      pdfBytes = pdfFile.bytes!;
    } else if (!kIsWeb && pdfFile.path != null) {
      pdfBytes = await File(pdfFile.path!).readAsBytes();
    } else {
      throw Exception('PDF data is missing for ${pdfFile.name}.');
    }

    Uint8List sigBytes;
    if (signatureImageFile.bytes != null) {
      sigBytes = signatureImageFile.bytes!;
    } else if (!kIsWeb && signatureImageFile.path != null) {
      sigBytes = await File(signatureImageFile.path!).readAsBytes();
    } else {
      throw Exception('Signature image data is missing.');
    }

    final PdfDocument document = PdfDocument(inputBytes: pdfBytes);

    try {
      if (pageIndex < 0 || pageIndex >= document.pages.count) {
        throw Exception('Invalid page index selected.');
      }

      final PdfPage page = document.pages[pageIndex];
      final PdfBitmap signature = PdfBitmap(sigBytes);

      page.graphics.drawImage(
        signature,
        Rect.fromLTWH(x, y, width, height),
      );

      final List<int> outBytes = await document.save();
      return Uint8List.fromList(outBytes);
    } finally {
      document.dispose();
    }
  }
}
