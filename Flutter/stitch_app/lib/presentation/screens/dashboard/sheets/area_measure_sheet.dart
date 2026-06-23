import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import 'sheet_header.dart';

void showAreaMeasureSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulAreaMeasureSheet();
    },
  );
}

class _StatefulAreaMeasureSheet extends StatefulWidget {
  const _StatefulAreaMeasureSheet();

  @override
  State<_StatefulAreaMeasureSheet> createState() => _StatefulAreaMeasureSheetState();
}

class _StatefulAreaMeasureSheetState extends State<_StatefulAreaMeasureSheet> {
  PlatformFile? _selectedFile;
  bool _isLoading = false;
  String _error = '';

  // Interactive Bounding Box Coordinates (Percentages relative to preview card size)
  double _boxLeft = 15.0;
  double _boxTop = 20.0;
  double _boxWidth = 70.0;
  double _boxHeight = 45.0;

  Future<void> _pickFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
      );
      if (result != null && result.files.isNotEmpty) {
        setState(() {
          _selectedFile = result.files.first;
        });
      }
    } catch (e) {
      setState(() => _error = 'Error picking file: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Dimensions of preview area
    const double previewWidth = 260.0;
    const double previewHeight = 360.0;

    // Convert percentages to absolute pixels for rendering/display
    final double leftPx = (_boxLeft / 100) * previewWidth;
    final double topPx = (_boxTop / 100) * previewHeight;
    final double widthPx = (_boxWidth / 100) * previewWidth;
    final double heightPx = (_boxHeight / 100) * previewHeight;

    // Area Calculation: 1 pt = 0.0352778 cm. We mock 1 pixel = 0.5 points for calculation scale.
    final double areaCm2 = (widthPx * 0.5 * heightPx * 0.5) * 0.001244; // Scopes region in sq.cm

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
          buildSheetHeader(context, 'Measure Region Area'),
          if (_error.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.errorContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(_error, style: TextStyle(color: theme.colorScheme.onErrorContainer)),
            ),
            const SizedBox(height: AppTokens.gutter),
          ],
          if (_selectedFile == null) ...[
            GestureDetector(
              onTap: _pickFile,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
                decoration: BoxDecoration(
                  border: Border.all(color: theme.colorScheme.outlineVariant, style: BorderStyle.solid),
                  borderRadius: BorderRadius.circular(12),
                  color: isDark ? Colors.black12 : Colors.grey[50],
                ),
                child: const Column(
                  children: [
                    Icon(Icons.upload_file_rounded, size: 48, color: Colors.grey),
                    SizedBox(height: 12),
                    Text('Select PDF File', style: TextStyle(fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text('Choose a PDF to measure its bounding page regions', style: TextStyle(fontSize: 11, color: Colors.grey), textAlign: TextAlign.center),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
          ] else ...[
            Text(
              'File: ${_selectedFile!.name}',
              style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.bold),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AppTokens.stackMd),
            Center(
              child: Stack(
                children: [
                  // Mock Document Preview Card
                  Container(
                    width: previewWidth,
                    height: previewHeight,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                      border: Border.all(color: theme.colorScheme.outlineVariant),
                      boxShadow: const [AppTokens.shadowLevel1],
                      image: const DecorationImage(
                        image: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuAH2VLdur5vnNmxfu37gplsIGvXkC9Ap0iQE1khJ3AoZLJpgfXOiXmleH1FftYhFvEYFeklgzCv4B0f3C1r2cA4PlOkSdtSQRpddvGn1cmNUU4nJWc6q86wsTbKZc_3X3rQzalw95qj_H7gMWEBiiZYepSQaeV4v3Y4chjUBFRrHs_o4x11SFk_qkmLWTqYz2dkirdDaC_8z_pn7EpPe4txQ4JgDatF_Z7sVYWU-vuSMsBDe945tFEPR8-XYoVOG4-L_57uMbdqDI2W'),
                        fit: BoxFit.cover,
                        opacity: 0.85,
                      ),
                    ),
                  ),

                  // Draggable Measuring Bounding Box
                  Positioned(
                    left: leftPx,
                    top: topPx,
                    width: widthPx,
                    height: heightPx,
                    child: Container(
                      decoration: BoxDecoration(
                        color: theme.colorScheme.error.withOpacity(0.12),
                        border: Border.all(color: theme.colorScheme.error, width: 2),
                      ),
                      child: Stack(
                        clipBehavior: Clip.none,
                        children: [
                          // Draggable corner handle: Top-Left
                          Positioned(
                            left: -10,
                            top: -10,
                            child: GestureDetector(
                              onPanUpdate: (details) {
                                setState(() {
                                  double dxPct = (details.delta.dx / previewWidth) * 100;
                                  double dyPct = (details.delta.dy / previewHeight) * 100;
                                  _boxLeft = (_boxLeft + dxPct).clamp(0.0, _boxLeft + _boxWidth - 10);
                                  _boxWidth = (_boxWidth - dxPct).clamp(10.0, 100.0 - _boxLeft);
                                  _boxTop = (_boxTop + dyPct).clamp(0.0, _boxTop + _boxHeight - 10);
                                  _boxHeight = (_boxHeight - dyPct).clamp(10.0, 100.0 - _boxTop);
                                });
                              },
                              child: _buildHandle(theme),
                            ),
                          ),
                          // Draggable corner handle: Bottom-Right
                          Positioned(
                            right: -10,
                            bottom: -10,
                            child: GestureDetector(
                              onPanUpdate: (details) {
                                setState(() {
                                  double dxPct = (details.delta.dx / previewWidth) * 100;
                                  double dyPct = (details.delta.dy / previewHeight) * 100;
                                  _boxWidth = (_boxWidth + dxPct).clamp(10.0, 100.0 - _boxLeft);
                                  _boxHeight = (_boxHeight + dyPct).clamp(10.0, 100.0 - _boxTop);
                                });
                              },
                              child: _buildHandle(theme),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            // Measurement Info Table
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF282828) : const Color(0xFFF9F9F9),
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Region Bounds:', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                      Text('${widthPx.toInt()} × ${heightPx.toInt()} px', style: theme.textTheme.bodyMedium),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Calculated Area:', style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                      Text(
                        '${areaCm2.toStringAsFixed(2)} cm²',
                        style: theme.textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.error,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            Row(
              children: [
                Expanded(
                  child: StitchButton(
                    type: StitchButtonType.secondary,
                    text: 'Change File',
                    onPressed: _pickFile,
                  ),
                ),
                const SizedBox(width: AppTokens.gutter),
                Expanded(
                  child: StitchButton(
                    text: 'Lock Region',
                    onPressed: () {
                      HapticFeedback.mediumImpact();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Locked region area of ${areaCm2.toStringAsFixed(2)} cm² successfully!')),
                      );
                      Navigator.pop(context);
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

  Widget _buildHandle(ThemeData theme) {
    return Container(
      width: 20,
      height: 20,
      decoration: BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
        border: Border.all(color: theme.colorScheme.error, width: 2),
        boxShadow: const [
          BoxShadow(color: Colors.black12, blurRadius: 4, offset: Offset(0, 2)),
        ],
      ),
      child: Center(
        child: Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(
            color: theme.colorScheme.error,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}
