import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import 'sheet_header.dart';

void showScanQRSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulScanQRSheet();
    },
  );
}

class _StatefulScanQRSheet extends StatefulWidget {
  const _StatefulScanQRSheet();

  @override
  State<_StatefulScanQRSheet> createState() => _StatefulScanQRSheetState();
}

class _StatefulScanQRSheetState extends State<_StatefulScanQRSheet> with SingleTickerProviderStateMixin {
  final MobileScannerController _scannerController = MobileScannerController();
  bool _isScanning = false;
  String? _scannedData;
  late AnimationController _scanAnimationController;

  @override
  void initState() {
    super.initState();
    _scanAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _scanAnimationController.dispose();
    _scannerController.dispose();
    super.dispose();
  }

  void _triggerScan() {
    // MobileScanner automatically scans. This manual button can toggle scanner state or restart it.
    if (_scannedData != null) {
      setState(() {
        _scannedData = null;
      });
      _scannerController.start();
    }
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
          buildSheetHeader(context, 'Scan QR Code'),
          const SizedBox(height: AppTokens.stackMd),
          if (_scannedData == null) ...[
            Text(
              'Align the QR code within the frame to scan.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            Center(
              child: Container(
                width: 250,
                height: 250,
                decoration: BoxDecoration(
                  color: Colors.black,
                  borderRadius: BorderRadius.circular(AppTokens.radiusLg),
                  border: Border.all(color: theme.colorScheme.outlineVariant, width: 2),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(AppTokens.radiusLg - 2),
                  child: Stack(
                    children: [
                      // Camera Preview or Fallback
                      Positioned.fill(
                        child: MobileScanner(
                          controller: _scannerController,
                          onDetect: (capture) {
                            final List<Barcode> barcodes = capture.barcodes;
                            if (barcodes.isNotEmpty && _scannedData == null) {
                              HapticFeedback.heavyImpact();
                              setState(() {
                                _scannedData = barcodes.first.rawValue;
                              });
                            }
                          },
                        ),
                      ),
                      // Viewfinder Overlay Grid
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white.withOpacity(0.3), width: 30),
                          ),
                        ),
                      ),
                      // Draggable/Resizable viewfinder brackets
                      Center(
                        child: Container(
                          width: 160,
                          height: 160,
                          decoration: BoxDecoration(
                            border: Border.all(color: theme.colorScheme.error, width: 2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                      // Scanning line animation
                      AnimatedBuilder(
                        animation: _scanAnimationController,
                        builder: (context, child) {
                          final double top = _scanAnimationController.value * 250;
                          return Positioned(
                            top: top,
                            left: 30,
                            right: 30,
                            child: Container(
                              height: 2,
                              color: theme.colorScheme.error.withOpacity(0.8),
                            ),
                          );
                        },
                      ),
                      // Scanning Loading Overlay
                      if (_isScanning)
                        Container(
                          color: Colors.black54,
                          child: const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                CircularProgressIndicator(),
                                SizedBox(height: 12),
                                Text('Decoding QR Code...', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppTokens.stackLg * 1.5),
            Text(
              'Scanning is active. Point camera at a QR code.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.outline,
                fontStyle: FontStyle.italic,
              ),
            ),
          ] else ...[
            Icon(Icons.check_circle_outline_rounded, color: theme.colorScheme.primary, size: 54),
            const SizedBox(height: AppTokens.stackMd),
            Text(
              'QR Code Decoded Successfully',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: AppTokens.stackLg),
            Container(
              padding: const EdgeInsets.all(AppTokens.gutter),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF161616) : Colors.grey[50],
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                border: Border.all(color: theme.colorScheme.outlineVariant.withOpacity(0.3)),
              ),
              child: Text(
                _scannedData!,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontFamily: 'Courier',
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: AppTokens.stackLg * 1.5),
            Row(
              children: [
                Expanded(
                  child: StitchButton(
                    type: StitchButtonType.secondary,
                    text: 'Copy Text',
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: _scannedData!));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Scanned data copied to clipboard!')),
                      );
                    },
                  ),
                ),
                const SizedBox(width: AppTokens.gutter),
                Expanded(
                  child: StitchButton(
                    text: 'Scan Again',
                    onPressed: () {
                      setState(() {
                        _scannedData = null;
                      });
                    },
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: AppTokens.gutter),
        ],
      ),
    );
  }
}
