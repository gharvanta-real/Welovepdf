import 'dart:io';
import 'dart:typed_data';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:syncfusion_flutter_pdf/pdf.dart';

import 'pdf_merge_engine.dart';
import 'pdf_split_engine.dart';
import 'image_to_pdf_engine.dart';
import 'pdf_signer_engine.dart';
import 'pdf_protect_engine.dart';
import 'pdf_unlock_engine.dart';
import 'pdf_watermark_engine.dart';
import 'pdf_word_count_engine.dart';
import 'qr_generator_engine.dart';
import 'qr_scanner_engine.dart';
import 'ocr_engine.dart';

class OfflineEngineManager {
  /// Check if a specific toolId can be handled offline.
  static bool isOfflineCapable(String toolId) {
    final cleanId = toolId.toLowerCase().replaceAll('_', '-').trim();
    return cleanId == 'merge-pdf' ||
        cleanId == 'merge' ||
        cleanId == 'split-pdf' ||
        cleanId == 'split' ||
        cleanId == 'jpg-to-pdf' ||
        cleanId == 'jpg-pdf' ||
        cleanId == 'image-to-pdf' ||
        cleanId == 'protect-pdf' ||
        cleanId == 'protect' ||
        cleanId == 'unlock-pdf' ||
        cleanId == 'unlock' ||
        cleanId == 'watermark-pdf' ||
        cleanId == 'watermark' ||
        cleanId == 'sign-pdf' ||
        cleanId == 'signer' ||
        cleanId == 'word-count' ||
        cleanId == 'pdf-ocr' ||
        cleanId == 'ocr' ||
        cleanId == 'make-qr' ||
        cleanId == 'scan-qr';
  }

  /// Run the specified tool offline, saving the output locally on the device.
  /// Mimics the return map of ApiService.runPdfTool.
  static Future<Map<String, dynamic>> runOfflineTool({
    required String toolId,
    required List<PlatformFile> files,
    required Map<String, dynamic> options,
  }) async {
    final cleanId = toolId.toLowerCase().replaceAll('_', '-').trim();
    final timestamp = DateTime.now().millisecondsSinceEpoch;

    Uint8List resultBytes;
    String outputFileName;

    debugPrint('OfflineEngineManager: Processing $cleanId offline.');

    if (cleanId == 'merge-pdf' || cleanId == 'merge') {
      resultBytes = await PdfMergeEngine.merge(files: files);
      outputFileName = 'merged_$timestamp.pdf';
    } else if (cleanId == 'split-pdf' || cleanId == 'split') {
      if (files.isEmpty) throw Exception('No file provided for splitting.');
      final range = options['pageRange'] as String? ?? '1';
      resultBytes = await PdfSplitEngine.split(file: files.first, pageRange: range);
      outputFileName = 'split_$timestamp.pdf';
    } else if (cleanId == 'jpg-to-pdf' || cleanId == 'jpg-pdf' || cleanId == 'image-to-pdf') {
      resultBytes = await ImageToPdfEngine.convert(files: files);
      outputFileName = 'converted_$timestamp.pdf';
    } else if (cleanId == 'protect-pdf' || cleanId == 'protect') {
      if (files.isEmpty) throw Exception('No file provided for protection.');
      final password = options['password'] as String? ?? '';
      resultBytes = await PdfProtectEngine.protect(file: files.first, password: password);
      outputFileName = 'protected_$timestamp.pdf';
    } else if (cleanId == 'unlock-pdf' || cleanId == 'unlock') {
      if (files.isEmpty) throw Exception('No file provided for unlocking.');
      final password = options['password'] as String? ?? '';
      resultBytes = await PdfUnlockEngine.unlock(file: files.first, password: password);
      outputFileName = 'unlocked_$timestamp.pdf';
    } else if (cleanId == 'watermark-pdf' || cleanId == 'watermark') {
      if (files.isEmpty) throw Exception('No file provided for watermarking.');
      final text = options['watermarkText'] as String? ?? 'Watermark';
      final imageFile = options['watermarkImage'] as PlatformFile?;
      final opacity = double.tryParse(options['watermarkOpacity']?.toString() ?? '') ?? 0.3;

      if (imageFile != null) {
        resultBytes = await PdfWatermarkEngine.addImageWatermark(
          file: files.first,
          imageFile: imageFile,
          opacity: opacity,
        );
      } else {
        final angle = int.tryParse(options['watermarkAngle']?.toString() ?? '') ?? -45;
        final fontSize = double.tryParse(options['watermarkSize']?.toString() ?? '') ?? 40;
        final color = options['watermarkColor'] as String? ?? '#FF0000';
        resultBytes = await PdfWatermarkEngine.addTextWatermark(
          file: files.first,
          text: text,
          opacity: opacity,
          fontSize: fontSize,
          angle: angle,
          colorHex: color,
        );
      }
      outputFileName = 'watermarked_$timestamp.pdf';
    } else if (cleanId == 'sign-pdf' || cleanId == 'signer') {
      if (files.isEmpty) throw Exception('No PDF file provided for signing.');
      
      // Look for signature image either in options or as the second file
      PlatformFile? sigImage = options['signatureFile'] as PlatformFile?;
      if (sigImage == null && files.length > 1) {
        sigImage = files[1];
      }
      if (sigImage == null) throw Exception('No signature image provided.');

      final pageIndex = int.tryParse(options['pageIndex']?.toString() ?? '') ?? 0;
      final x = double.tryParse(options['x']?.toString() ?? '') ?? 100.0;
      final y = double.tryParse(options['y']?.toString() ?? '') ?? 100.0;
      final w = double.tryParse(options['width']?.toString() ?? '') ?? 150.0;
      final h = double.tryParse(options['height']?.toString() ?? '') ?? 50.0;

      resultBytes = await PdfSignerEngine.sign(
        pdfFile: files.first,
        signatureImageFile: sigImage,
        pageIndex: pageIndex,
        x: x,
        y: y,
        width: w,
        height: h,
      );
      outputFileName = 'signed_$timestamp.pdf';
    } else if (cleanId == 'word-count') {
      if (files.isEmpty) throw Exception('No file provided for word count.');
      final stats = await PdfWordCountEngine.count(file: files.first);
      final statsText = 'WORD COUNT STATS:\n'
          '-------------------\n'
          'Pages: ${stats['pageCount']}\n'
          'Words: ${stats['wordCount']}\n'
          'Lines: ${stats['lineCount']}\n'
          'Sentences: ${stats['sentenceCount']}\n'
          'Characters (with spaces): ${stats['characterCount']}\n'
          'Characters (no spaces): ${stats['characterCountNoSpaces']}\n';
      resultBytes = Uint8List.fromList(statsText.codeUnits);
      outputFileName = 'word_count_$timestamp.txt';
    } else if (cleanId == 'pdf-ocr' || cleanId == 'ocr') {
      if (files.isEmpty) throw Exception('No file provided for OCR.');
      if (kIsWeb) throw Exception('OCR is only supported on mobile devices.');
      final imagePath = files.first.path;
      if (imagePath == null) throw Exception('Local file path is required for OCR.');
      
      final recognizedText = await OcrEngine.processOcr(imagePath);
      resultBytes = Uint8List.fromList(recognizedText.codeUnits);
      outputFileName = 'ocr_$timestamp.txt';
    } else if (cleanId == 'make-qr') {
      final textData = options['data'] as String? ?? 'https://pdfmount.online';
      final size = double.tryParse(options['size']?.toString() ?? '') ?? 512.0;
      resultBytes = await QrGeneratorEngine.generate(data: textData, size: size);
      outputFileName = 'qr_$timestamp.png';
    } else if (cleanId == 'scan-qr') {
      if (files.isEmpty) throw Exception('No image provided for QR scanning.');
      if (kIsWeb) throw Exception('QR scanning from files is only supported on mobile devices.');
      final imagePath = files.first.path;
      if (imagePath == null) throw Exception('Local file path is required for QR scanning.');

      final qrContent = await QrScannerEngine.scanImageFile(imagePath);
      if (qrContent == null) {
        throw Exception('No QR code detected in the selected image.');
      }
      resultBytes = Uint8List.fromList(qrContent.codeUnits);
      outputFileName = 'scanned_qr_$timestamp.txt';
    } else {
      throw Exception('Unsupported tool for offline execution: $toolId');
    }

    // Determine pagesCount for PDF files
    int pagesCount = 1;
    if (outputFileName.endsWith('.pdf')) {
      try {
        final PdfDocument tempDoc = PdfDocument(inputBytes: resultBytes);
        pagesCount = tempDoc.pages.count;
        tempDoc.dispose();
      } catch (e) {
        debugPrint('Error reading page count from generated PDF: $e');
      }
    }

    List<String>? sourceImagePaths;
    List<Uint8List>? sourceImageBytes;
    if (cleanId == 'jpg-to-pdf' || cleanId == 'jpg-pdf' || cleanId == 'image-to-pdf') {
      sourceImagePaths = files.map((f) => kIsWeb ? '' : (f.path ?? '')).where((p) => p.isNotEmpty).toList();
      sourceImageBytes = files.map((f) => f.bytes).where((b) => b != null).cast<Uint8List>().toList();
    }

    // Save locally
    String savedPath;
    if (kIsWeb) {
      savedPath = 'web_download/$outputFileName';
    } else {
      final docDir = await getApplicationDocumentsDirectory();
      final dirPath = p.join(docDir.path, 'downloaded_pdfs');
      await Directory(dirPath).create(recursive: true);

      final localFile = File(p.join(dirPath, outputFileName));
      await localFile.writeAsBytes(resultBytes);
      savedPath = localFile.path;
      debugPrint('OfflineEngineManager: Saved output locally to: $savedPath');
    }

    return {
      'filePath': savedPath,
      'fileName': outputFileName,
      'fileSize': _formatBytes(resultBytes.length),
      'bytes': resultBytes.length,
      'fileData': resultBytes,
      'pagesCount': pagesCount,
      'sourceImagePaths': sourceImagePaths,
      'sourceImageBytes': sourceImageBytes,
    };
  }

  static String _formatBytes(int bytes) {
    if (bytes <= 0) return '0 Bytes';
    const suffixes = ['Bytes', 'KB', 'MB', 'GB'];
    double size = bytes.toDouble();
    int index = 0;
    while (size >= 1024 && index < suffixes.length - 1) {
      size /= 1024;
      index++;
    }
    return '${size.toStringAsFixed(1)} ${suffixes[index]}';
  }
}
