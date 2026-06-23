import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart' show kIsWeb, debugPrint;
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class ApiService {
  static String get baseUrl {
    if (kIsWeb) {
      final host = Uri.base.host;
      final scheme = Uri.base.scheme;
      
      // In production, Nginx proxies requests to the backend under the same hostname.
      if (host.endsWith('pdfmount.online')) {
        return '$scheme://$host';
      }
      
      // In local development, direct requests to port 8080 on the host hostname/IP.
      final devHost = host.isNotEmpty ? host : 'localhost';
      return 'http://$devHost:8080';
    }
    // Set to your computer's local Wi-Fi IP address so physical phones or emulators can connect.
    return 'http://192.168.1.2:8080';
  }

  /// Runs the selected PDF tool on the backend by uploading files and options,
  /// then downloading the resulting file and saving it locally.
  /// Returns a map with { 'filePath': String, 'fileName': String, 'fileSize': String, 'bytes': int }
  static Future<Map<String, dynamic>> runPdfTool({
    required String toolId,
    required List<PlatformFile> files,
    required Map<String, dynamic> options,
  }) async {
    // 1. Prepare endpoint
    String endpoint;
    if (toolId == 'merge-pdf' || toolId == 'merge') {
      endpoint = '$baseUrl/upload/merge-pdf';
    } else if (toolId == 'compress-pdf' || toolId == 'compress') {
      endpoint = '$baseUrl/upload/compress';
    } else if (toolId == 'jpg-to-pdf' || toolId == 'jpg-pdf') {
      endpoint = '$baseUrl/upload/jpg-to-pdf';
    } else if (toolId == 'pdf-to-jpg' || toolId == 'pdf-jpg') {
      endpoint = '$baseUrl/upload/pdf-to-jpg';
    } else {
      final cleanId = toolId.toLowerCase().replaceAll(RegExp(r'\s+'), '-');
      endpoint = '$baseUrl/upload/$cleanId';
    }

    debugPrint('Connecting to backend API: $endpoint');

    // 2. Prepare Multipart Request
    final uri = Uri.parse(endpoint);
    final request = http.MultipartRequest('POST', uri);

    // 3. Add Custom Headers (Options)
    options.forEach((key, val) {
      if (val != null) {
        // Convert camelCase to kebab-case
        final headerKey = 'x-${key.replaceAllMapped(RegExp(r'([A-Z])'), (m) => '-${m.group(0)!.toLowerCase()}')}';
        request.headers[headerKey] = val.toString();
      }
    });

    // 4. Add Files to request
    for (final file in files) {
      if (kIsWeb) {
        if (file.bytes != null) {
          request.files.add(
            http.MultipartFile.fromBytes(
              'files',
              file.bytes!,
              filename: file.name,
              contentType: MediaType('application', _getMimeSubtype(file.name)),
            ),
          );
        } else {
          throw Exception('File bytes are missing on Web platform.');
        }
      } else {
        if (file.path != null) {
          request.files.add(
            await http.MultipartFile.fromPath(
              'files',
              file.path!,
              filename: file.name,
              contentType: MediaType('application', _getMimeSubtype(file.name)),
            ),
          );
        } else {
          throw Exception('File path is missing on Native platform.');
        }
      }
    }

    // 5. Send Upload Request
    final responseStream = await request.send();
    final response = await http.Response.fromStream(responseStream);

    if (response.statusCode != 200) {
      String errMsg = 'Request failed';
      try {
        final decoded = jsonDecode(response.body);
        errMsg = decoded['error'] ?? errMsg;
      } catch (_) {
        if (response.body.isNotEmpty) errMsg = response.body;
      }
      throw Exception(errMsg);
    }

    // 6. Parse result JSON
    final result = jsonDecode(response.body);
    final jobId = result['job_id'] as String;
    final outputRawPath = result['output_path'] as String;
    final finalBytes = result['bytes'] as int;

    final outputFileName = p.basename(outputRawPath);
    final downloadUrl = '$baseUrl/download/$jobId/$outputFileName';

    debugPrint('Job completed! Job ID: $jobId. Downloading output: $downloadUrl');

    // 7. Download processed file
    final downloadResponse = await http.get(Uri.parse(downloadUrl));
    if (downloadResponse.statusCode != 200) {
      throw Exception('Failed to download output file from backend: ${downloadResponse.body}');
    }

    final Uint8List fileData = downloadResponse.bodyBytes;

    // 8. Save local copy on the device
    String savedPath;
    if (kIsWeb) {
      // On web we cannot save to local app storage path, so we use a mock virtual path
      savedPath = 'web_download/$outputFileName';
    } else {
      final docDir = await getApplicationDocumentsDirectory();
      // Make sure the directory structure exists
      final dirPath = p.join(docDir.path, 'downloaded_pdfs');
      await Directory(dirPath).create(recursive: true);
      
      final localFile = File(p.join(dirPath, outputFileName));
      await localFile.writeAsBytes(fileData);
      savedPath = localFile.path;
      debugPrint('Saved file locally to: $savedPath');
    }

    return {
      'filePath': savedPath,
      'fileName': outputFileName,
      'fileSize': _formatBytes(finalBytes),
      'bytes': finalBytes,
      'fileData': fileData, // keep bytes in case we want to view it directly in web memory
    };
  }

  static String _getMimeSubtype(String fileName) {
    final ext = p.extension(fileName).toLowerCase();
    if (ext == '.pdf') return 'pdf';
    if (ext == '.docx' || ext == '.doc') return 'vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (ext == '.xlsx' || ext == '.xls') return 'vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (ext == '.pptx' || ext == '.ppt') return 'vnd.openxmlformats-officedocument.presentationml.presentation';
    if (ext == '.jpg' || ext == '.jpeg') return 'jpeg';
    if (ext == '.png') return 'png';
    return 'octet-stream';
  }

  static String _formatBytes(int bytes) {
    if (bytes <= 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    final i = (bytes > 0) ? (bytes / k).floor() : 0;
    final index = i < sizes.length ? i : sizes.length - 1;
    final size = bytes / (1 << (10 * index));
    return '${size.toStringAsFixed(1)} ${sizes[index]}';
  }
}
