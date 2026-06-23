import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../state/app_state.dart';
import 'sheet_header.dart';

void showWatermarkSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulWatermarkSheet();
    },
  );
}

class _StatefulWatermarkSheet extends StatefulWidget {
  const _StatefulWatermarkSheet();

  @override
  State<_StatefulWatermarkSheet> createState() => _StatefulWatermarkSheetState();
}

class _StatefulWatermarkSheetState extends State<_StatefulWatermarkSheet> {
  PlatformFile? _selectedFile;
  final TextEditingController _textController = TextEditingController(text: 'DRAFT');
  String _colorHex = '#FF0000'; // Default to red
  double _opacity = 0.2;
  bool _isLoading = false;
  bool _isSuccess = false;
  String _error = '';

  @override
  void dispose() {
    _textController.dispose();
    super.dispose();
  }

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

  Future<void> _runWatermark(AppState state) async {
    if (_selectedFile == null || _textController.text.isEmpty) return;
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      await state.processTool('watermark-pdf', [_selectedFile!], {
        'watermarkText': _textController.text,
        'watermarkColor': _colorHex,
        'watermarkOpacity': _opacity.toString(),
      });

      setState(() {
        _isLoading = false;
        _isSuccess = true;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
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
          buildSheetHeader(context, 'Add Text Watermark'),
          if (_error.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.errorContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                _error,
                style: TextStyle(color: theme.colorScheme.onErrorContainer),
              ),
            ),
            const SizedBox(height: AppTokens.gutter),
          ],
          if (!_isSuccess && !_isLoading) ...[
            GestureDetector(
              onTap: _pickFile,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: theme.colorScheme.outlineVariant),
                  borderRadius: BorderRadius.circular(8),
                  color: isDark ? Colors.black12 : Colors.grey[50],
                ),
                child: Row(
                  children: [
                    const Icon(Icons.picture_as_pdf, color: Colors.red, size: 36),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _selectedFile?.name ?? 'Tap to select PDF file',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (_selectedFile != null)
                            Text('${(_selectedFile!.size / 1024 / 1024).toStringAsFixed(2)} MB')
                          else
                            const Text('Select PDF from device storage'),
                        ],
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_right),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTokens.gutter),
            
            TextField(
              controller: _textController,
              decoration: const InputDecoration(
                labelText: 'Watermark Text',
                hintText: 'e.g. CONFIDENTIAL, DRAFT, COPY',
              ),
            ),
            const SizedBox(height: AppTokens.gutter),
            
            // Color picker dropdown
            DropdownButtonFormField<String>(
              value: _colorHex,
              decoration: const InputDecoration(labelText: 'Text Color'),
              items: const [
                DropdownMenuItem(value: '#FF0000', child: Text('Red')),
                DropdownMenuItem(value: '#0000FF', child: Text('Blue')),
                DropdownMenuItem(value: '#008000', child: Text('Green')),
                DropdownMenuItem(value: '#808080', child: Text('Gray')),
                DropdownMenuItem(value: '#000000', child: Text('Black')),
              ],
              onChanged: (val) => setState(() => _colorHex = val ?? '#FF0000'),
            ),
            const SizedBox(height: AppTokens.gutter),
            
            // Opacity slider
            Row(
              children: [
                const Text('Opacity: ', style: TextStyle(fontWeight: FontWeight.w500)),
                Expanded(
                  child: Slider(
                    value: _opacity,
                    min: 0.05,
                    max: 0.95,
                    divisions: 18,
                    label: '${(_opacity * 100).toInt()}%',
                    onChanged: (val) => setState(() => _opacity = val),
                  ),
                ),
                Text('${(_opacity * 100).toInt()}%'),
              ],
            ),
            const SizedBox(height: AppTokens.stackLg),
            
            StitchButton(
              type: StitchButtonType.primary,
              text: 'Apply Watermark',
              onPressed: _selectedFile == null || _textController.text.isEmpty ? null : () => _runWatermark(state),
            ),
          ] else if (_isLoading) ...[
            const SizedBox(height: 20),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            const Center(child: Text('Overlaying watermark stamp...', style: TextStyle(fontWeight: FontWeight.w500))),
            const SizedBox(height: 10),
          ] else ...[
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: AppTokens.gutter),
            const Center(
              child: Text(
                'Watermark applied successfully!\nOverlay saved to the PDF pages.',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            StitchButton(
              type: StitchButtonType.ghost,
              text: 'Done',
              onPressed: () => Navigator.pop(context),
            ),
          ],
          const SizedBox(height: AppTokens.gutter),
        ],
      ),
    );
  }
}
