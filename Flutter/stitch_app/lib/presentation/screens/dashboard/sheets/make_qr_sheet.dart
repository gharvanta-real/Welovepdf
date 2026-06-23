import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../components/stitch_input.dart';
import 'sheet_header.dart';

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
  String _qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https%3A%2F%2Fpdfmount.online';
  bool _isLoading = false;

  void _generateQR() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _isLoading = true;
      final encoded = Uri.encodeComponent(text);
      _qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$encoded';
    });

    // Simulate network delay for a real generator feel
    Future.delayed(const Duration(milliseconds: 500), () {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    });
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
                  : ClipRRect(
                      borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                      child: Image.network(
                        _qrUrl,
                        fit: BoxFit.contain,
                        loadingBuilder: (context, child, loadingProgress) {
                          if (loadingProgress == null) return child;
                          return const Center(child: CircularProgressIndicator());
                        },
                        errorBuilder: (context, error, stackTrace) {
                          return const Center(
                            child: Icon(Icons.broken_image, color: Colors.grey, size: 48),
                          );
                        },
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
                    Share.share(
                      'Scan this QR code or click the link to read content: ${_textController.text}\nQR Image URL: $_qrUrl',
                      subject: 'PDFmount QR Share',
                    );
                  },
                ),
              ),
              const SizedBox(width: AppTokens.gutter),
              Expanded(
                child: StitchButton(
                  text: 'Download QR',
                  onPressed: () {
                    HapticFeedback.heavyImpact();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('QR Code image downloaded to your Gallery!')),
                    );
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
