import 'dart:io';
import 'dart:typed_data';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';
import 'package:syncfusion_flutter_pdf/pdf.dart';
import 'package:path/path.dart' as p;

class OcrEngine {
  /// Processes OCR for a file (PDF or Image) offline.
  /// For PDF files, extracts the text using PdfTextExtractor.
  /// For image files, runs Google ML Kit Text Recognition.
  static Future<String> processOcr(String filePath) async {
    final file = File(filePath);
    if (!await file.exists()) {
      throw Exception('File not found: $filePath');
    }

    final extension = p.extension(filePath).toLowerCase();

    if (extension == '.pdf') {
      // 1. Text-based PDF extraction
      final Uint8List pdfBytes = await file.readAsBytes();
      final PdfDocument document = PdfDocument(inputBytes: pdfBytes);
      try {
        final PdfTextExtractor extractor = PdfTextExtractor(document);
        final String text = extractor.extractText();
        if (text.trim().isNotEmpty) {
          return text;
        } else {
          return 'No selectable text found in this PDF.\n'
              'This might be a scanned document. To OCR scanned documents offline, '
              'please capture/upload them as image files (JPG/PNG) using the OCR tool.';
        }
      } finally {
        document.dispose();
      }
    } else if (extension == '.png' || extension == '.jpg' || extension == '.jpeg') {
      // 2. Offline Image OCR using Google ML Kit
      return await recognizeText(filePath);
    } else {
      throw Exception('Unsupported file type for offline OCR: $extension');
    }
  }

  /// Recognizes text from a local image file offline using Google ML Kit.
  static Future<String> recognizeText(String imagePath) async {
    final InputImage inputImage = InputImage.fromFilePath(imagePath);
    final TextRecognizer textRecognizer = TextRecognizer(script: TextRecognitionScript.latin);

    try {
      final RecognizedText recognizedText = await textRecognizer.processImage(inputImage);
      return recognizedText.text;
    } finally {
      await textRecognizer.close();
    }
  }
}
