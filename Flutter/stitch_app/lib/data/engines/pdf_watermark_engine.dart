import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'package:flutter/painting.dart';

class PdfWatermarkEngine {
  static Future<Uint8List> addTextWatermark({
    required PlatformFile file,
    required String text,
    double opacity = 0.3, // 0.0 to 1.0
    double fontSize = 40,
    int angle = -45, // Rotation angle
    String colorHex = '#FF0000', // Hex color representation
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
      final PdfFont font = PdfStandardFont(PdfFontFamily.helvetica, fontSize, style: PdfFontStyle.bold);
      final PdfColor color = _parseHexColor(colorHex);
      final PdfBrush brush = PdfSolidBrush(color);

      for (int i = 0; i < document.pages.count; i++) {
        final PdfPage page = document.pages[i];
        final PdfGraphics graphics = page.graphics;
        
        // Save graphic state
        final PdfGraphicsState state = graphics.save();

        // Apply transparency
        graphics.setTransparency(opacity);

        // Center transform
        final double width = page.getClientSize().width;
        final double height = page.getClientSize().height;
        graphics.translateTransform(width / 2, height / 2);
        graphics.rotateTransform(angle.toDouble());

        // Calculate string size to draw exactly centered
        final Size textSize = font.measureString(text);

        graphics.drawString(
          text,
          font,
          brush: brush,
          bounds: Rect.fromLTWH(
            -textSize.width / 2,
            -textSize.height / 2,
            textSize.width,
            textSize.height,
          ),
        );

        // Restore graphics state
        graphics.restore(state);
      }

      final List<int> outBytes = await document.save();
      return Uint8List.fromList(outBytes);
    } finally {
      document.dispose();
    }
  }

  static Future<Uint8List> addImageWatermark({
    required PlatformFile file,
    required PlatformFile imageFile,
    double opacity = 0.3,
    double scale = 0.5, // Scale relative to page size
  }) async {
    Uint8List bytes;
    if (file.bytes != null) {
      bytes = file.bytes!;
    } else if (!kIsWeb && file.path != null) {
      bytes = await File(file.path!).readAsBytes();
    } else {
      throw Exception('File data is missing for ${file.name}.');
    }

    Uint8List imgBytes;
    if (imageFile.bytes != null) {
      imgBytes = imageFile.bytes!;
    } else if (!kIsWeb && imageFile.path != null) {
      imgBytes = await File(imageFile.path!).readAsBytes();
    } else {
      throw Exception('Watermark image data is missing.');
    }

    final PdfDocument document = PdfDocument(inputBytes: bytes);

    try {
      final PdfBitmap bitmap = PdfBitmap(imgBytes);

      for (int i = 0; i < document.pages.count; i++) {
        final PdfPage page = document.pages[i];
        final PdfGraphics graphics = page.graphics;
        
        final PdfGraphicsState state = graphics.save();

        graphics.setTransparency(opacity);

        final double pageWidth = page.getClientSize().width;
        final double pageHeight = page.getClientSize().height;

        // Calculate watermark bounds to center it on page
        final double wmWidth = pageWidth * scale;
        final double wmHeight = wmWidth * (bitmap.height / bitmap.width);
        final double x = (pageWidth - wmWidth) / 2;
        final double y = (pageHeight - wmHeight) / 2;

        graphics.drawImage(
          bitmap,
          Rect.fromLTWH(x, y, wmWidth, wmHeight),
        );

        graphics.restore(state);
      }

      final List<int> outBytes = await document.save();
      return Uint8List.fromList(outBytes);
    } finally {
      document.dispose();
    }
  }

  static PdfColor _parseHexColor(String hexString) {
    String cleanHex = hexString.replaceAll('#', '');
    if (cleanHex.length == 6) {
      cleanHex = 'FF$cleanHex';
    }
    final int val = int.tryParse(cleanHex, radix: 16) ?? 0xFFFF0000;
    final int r = (val >> 16) & 0xFF;
    final int g = (val >> 8) & 0xFF;
    final int b = val & 0xFF;
    return PdfColor(r, g, b);
  }
}
