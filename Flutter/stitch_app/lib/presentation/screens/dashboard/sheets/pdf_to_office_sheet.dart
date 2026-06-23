import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../state/app_state.dart';
import 'sheet_header.dart';

void showPdfToOfficeSheet(BuildContext context, String targetFormat) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return _StatefulPdfToOfficeSheet(targetFormat: targetFormat);
    },
  );
}

class _StatefulPdfToOfficeSheet extends StatefulWidget {
  final String targetFormat; // 'Word', 'Excel', 'PPT', 'TXT', 'HTML', 'Image'
  const _StatefulPdfToOfficeSheet({required this.targetFormat});

  @override
  State<_StatefulPdfToOfficeSheet> createState() => _StatefulPdfToOfficeSheetState();
}

class _StatefulPdfToOfficeSheetState extends State<_StatefulPdfToOfficeSheet> {
  PlatformFile? _selectedFile;
  bool _isLoading = false;
  bool _isSuccess = false;
  String _error = '';

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

  Future<void> _runConversion(AppState state) async {
    if (_selectedFile == null) return;
    setState(() {
      _isLoading = true;
      _error = '';
    });

    // Map UI target formats to backend tool names
    String toolId = 'pdf-to-word';
    if (widget.targetFormat == 'Excel') toolId = 'pdf-to-excel';
    if (widget.targetFormat == 'PPT') toolId = 'pdf-to-ppt';
    if (widget.targetFormat == 'TXT') toolId = 'pdf-to-txt';
    if (widget.targetFormat == 'HTML') toolId = 'pdf-to-html';
    if (widget.targetFormat == 'Image') toolId = 'pdf-to-png';

    try {
      await state.processTool(toolId, [_selectedFile!], {
        'pdfToWordMode': 'flowing',
        'pdfToWordOcr': 'true',
        'pdfToWordLang': 'en',
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

    final String formatExt = widget.targetFormat == 'Word' ? '.docx' :
                           widget.targetFormat == 'Excel' ? '.xlsx' :
                           widget.targetFormat == 'PPT' ? '.pptx' :
                           widget.targetFormat == 'TXT' ? '.txt' :
                           widget.targetFormat == 'HTML' ? '.html' : '.zip';

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
          buildSheetHeader(context, 'PDF to ${widget.targetFormat} Converter'),
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
                            const Text('Select source PDF file'),
                        ],
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_right),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            StitchButton(
              type: StitchButtonType.primary,
              text: 'Convert PDF to ${widget.targetFormat}',
              onPressed: _selectedFile == null ? null : () => _runConversion(state),
            ),
          ] else if (_isLoading) ...[
            const SizedBox(height: 20),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            Center(child: Text('Extracting structure and rendering as $formatExt format...', style: const TextStyle(fontWeight: FontWeight.w500))),
            const SizedBox(height: 10),
          ] else ...[
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: AppTokens.gutter),
            Center(
              child: Text(
                'PDF converted to ${widget.targetFormat} successfully!\nOutput file ($formatExt) added to dashboard.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            StitchButton(
              type: StitchButtonType.ghost,
              text: 'Close',
              onPressed: () => Navigator.pop(context),
            ),
          ],
          const SizedBox(height: AppTokens.gutter),
        ],
      ),
    );
  }
}
