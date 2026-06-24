import 'package:mobile_scanner/mobile_scanner.dart';

class QrScannerEngine {
  /// Scans a local image file for QR codes offline.
  /// Returns the raw value of the first detected QR code, or null if none found.
  static Future<String?> scanImageFile(String imagePath) async {
    final MobileScannerController controller = MobileScannerController();
    try {
      final barcodeCapture = await controller.analyzeImage(imagePath);
      if (barcodeCapture != null && barcodeCapture.barcodes.isNotEmpty) {
        return barcodeCapture.barcodes.first.rawValue;
      }
    } catch (e) {
      // Analyze image might fail if format is unsupported or file not found
      return null;
    } finally {
      controller.dispose();
    }
    return null;
  }
}
