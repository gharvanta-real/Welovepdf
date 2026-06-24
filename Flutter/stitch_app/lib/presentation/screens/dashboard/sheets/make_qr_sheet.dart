import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../components/stitch_input.dart';
import 'sheet_header.dart';

import 'dart:io';
import 'dart:typed_data';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../../../../data/engines/qr_generator_engine.dart';

void showMakeQRSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulMakeQRSheet();
    },
  );
}

class _StatefulMakeQRSheet extends StatefulWidget {
  const _StatefulMakeQRSheet();

  @override
  State<_StatefulMakeQRSheet> createState() => _StatefulMakeQRSheetState();
}

class _StatefulMakeQRSheetState extends State<_StatefulMakeQRSheet> {
  final _textController = TextEditingController(text: 'https://pdfmount.online');
  Uint8List? _qrBytes;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _generateQR();
  }

  Future<void> _generateQR() async {
    final text = _textController.text.trim();
    if (text.isEmpty) {
      setState(() {
        _qrBytes = null;
      });
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final bytes = await QrGeneratorEngine.generate(data: text, size: 512);
      if (mounted) {
        setState(() {
          _qrBytes = bytes;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _shareQR() async {
    if (_qrBytes == null) return;
    try {
      final tempDir = await getTemporaryDirectory();
      final tempFile = File(p.join(tempDir.path, 'qr_share.png'));
      await tempFile.writeAsBytes(_qrBytes!);
      
      await Share.shareXFiles(
        [XFile(tempFile.path)],
        text: 'Scan this QR code: ${_textController.text}',
        subject: 'PDFmount QR Share',
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error sharing QR Code: $e')),
      );
    }
  }

  Future<void> _downloadQR() async {
    if (_qrBytes == null) return;
    try {
      final docDir = await getApplicationDocumentsDirectory();
      final dirPath = p.join(docDir.path, 'downloaded_qr');
      await Directory(dirPath).create(recursive: true);
      
      final file = File(p.join(dirPath, 'qr_${DateTime.now().millisecondsSinceEpoch}.png'));
      await file.writeAsBytes(_qrBytes!);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('QR Code saved offline: ${p.basename(file.path)}')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving QR Code: $e')),
      );
    }
  }

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTokens.radiusXl)),
      ),
      padding: EdgeInsets.only(
        left: AppTokens.containerPadding,
        right: AppTokens.containerPadding,
        bottom: MediaQuery.of(context).viewInsets.bottom + AppTokens.containerPadding,
        top: AppTokens.containerPadding,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          buildSheetHeader(context, 'Generate QR Code'),
          const SizedBox(height: AppTokens.stackMd),
          StitchTextField(
            controller: _textController,
            labelText: 'QR Content (Link or Text)',
            hintText: 'Enter website URL or custom message',
            onChanged: (_) => _generateQR(),
          ),
          const SizedBox(height: AppTokens.stackLg),
          Center(
            child: Container(
              width: 200,
              height: 200,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(AppTokens.radiusLg),
                border: Border.all(
                  color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                  width: 1.5,
                ),
                boxShadow: const [AppTokens.shadowLevel1],
              ),
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _qrBytes == null
                      ? const Center(
                          child: Icon(Icons.qr_code, color: Colors.grey, size: 48),
                        )
                      : ClipRRect(
                          borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                          child: Image.memory(
                            _qrBytes!,
                            fit: BoxFit.contain,
                          ),
                        ),
            ),
          ),
          const SizedBox(height: AppTokens.stackLg * 1.5),
          Row(
            children: [
              Expanded(
                child: StitchButton(
                  type: StitchButtonType.secondary,
                  text: 'Share QR',
                  onPressed: () {
                    HapticFeedback.mediumImpact();
                    _shareQR();
                  },
                ),
              ),
              const SizedBox(width: AppTokens.gutter),
              Expanded(
                child: StitchButton(
                  text: 'Download QR',
                  onPressed: () {
                    HapticFeedback.heavyImpact();
                    _downloadQR();
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: AppTokens.gutter),
        ],
      ),
    );
  }
}
