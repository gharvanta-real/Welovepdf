import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:syncfusion_flutter_pdf/pdf.dart';

class PdfProtectEngine {
  static Future<Uint8List> protect({
    required PlatformFile file,
    required String password,
  }) async {
    if (password.isEmpty) {
      throw Exception('Password cannot be empty.');
    }

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
      // Set encryption options
      final PdfSecurity security = document.security;
      security.userPassword = password;
      security.ownerPassword = password; // Set same password for owner for simplicity
      security.algorithm = PdfEncryptionAlgorithm.aesx256Bit;

      final List<int> outBytes = await document.save();
      return Uint8List.fromList(outBytes);
    } finally {
      document.dispose();
    }
  }
}
