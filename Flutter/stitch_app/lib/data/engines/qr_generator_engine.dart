import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';

class QrGeneratorEngine {
  static Future<Uint8List> generate({
    required String data,
    double size = 512,
    String fgColorHex = '#000000',
    String bgColorHex = '#FFFFFF',
  }) async {
    final qrValidationResult = QrValidator.validate(
      data: data,
      version: QrVersions.auto,
      errorCorrectionLevel: QrErrorCorrectLevel.Q,
    );

    if (qrValidationResult.status == QrValidationStatus.valid) {
      final qrCode = qrValidationResult.qrCode!;

      final fgColor = _parseHexColor(fgColorHex);
      final bgColor = _parseHexColor(bgColorHex);

      final painter = QrPainter.withQr(
        qr: qrCode,
        color: fgColor,
        emptyColor: bgColor,
        gapless: true,
      );

      // Render to image
      final ui.Image image = await painter.toImage(size);
      final ByteData? byteData = await image.toByteData(format: ui.ImageByteFormat.png);

      if (byteData == null) {
        throw Exception('Failed to render QR Code image.');
      }

      return byteData.buffer.asUint8List();
    } else {
      throw Exception('Failed to validate QR data: ${qrValidationResult.error}');
    }
  }

  static Color _parseHexColor(String hexString) {
    String cleanHex = hexString.replaceAll('#', '');
    if (cleanHex.length == 6) {
      cleanHex = 'FF$cleanHex';
    }
    final int val = int.tryParse(cleanHex, radix: 16) ?? 0xFF000000;
    return Color(val);
  }
}
