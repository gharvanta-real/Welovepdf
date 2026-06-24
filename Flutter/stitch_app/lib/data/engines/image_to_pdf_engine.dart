import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'package:flutter/painting.dart';

class ImageToPdfEngine {
  static Future<Uint8List> convert({
    required List<PlatformFile> files,
  }) async {
    if (files.isEmpty) {
      throw Exception('No images selected.');
    }

    final PdfDocument document = PdfDocument();

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

        final PdfPage page = document.pages.add();
        final PdfBitmap image = PdfBitmap(bytes);

        // Draw image to cover the entire page
        page.graphics.drawImage(
          image,
          Rect.fromLTWH(
            0,
            0,
            page.getClientSize().width,
            page.getClientSize().height,
          ),
        );
      }

      final List<int> outBytes = await document.save();
      return Uint8List.fromList(outBytes);
    } finally {
      document.dispose();
    }
  }
}
