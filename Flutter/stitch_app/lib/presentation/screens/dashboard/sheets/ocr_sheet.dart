import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../state/app_state.dart';
import 'sheet_header.dart';

void showOCRSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulOCRSheet();
    },
  );
}

class _StatefulOCRSheet extends StatefulWidget {
  const _StatefulOCRSheet();

  @override
  State<_StatefulOCRSheet> createState() => _StatefulOCRSheetState();
}

class _StatefulOCRSheetState extends State<_StatefulOCRSheet> {
  PlatformFile? _selectedFile;
  String _language = 'en';
  String _engineMode = 'balanced';
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

  Future<void> _runOCR(AppState state) async {
    if (_selectedFile == null) return;
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      await state.processTool('pdf-ocr', [_selectedFile!], {
        'ocrLanguage': _language,
        'ocrEngineMode': _engineMode,
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
          buildSheetHeader(context, 'PDF OCR & Searchable Text'),
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
                            const Text('Select scanned PDF from storage'),
                        ],
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_right),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTokens.gutter),
            
            // Language dropdown
            DropdownButtonFormField<String>(
              value: _language,
              decoration: const InputDecoration(labelText: 'Document Language'),
              items: const [
                DropdownMenuItem(value: 'en', child: Text('English (eng)')),
                DropdownMenuItem(value: 'es', child: Text('Spanish (spa)')),
                DropdownMenuItem(value: 'fr', child: Text('French (fra)')),
                DropdownMenuItem(value: 'de', child: Text('German (deu)')),
                DropdownMenuItem(value: 'hi', child: Text('Hindi (hin)')),
              ],
              onChanged: (val) => setState(() => _language = val ?? 'en'),
            ),
            const SizedBox(height: AppTokens.gutter),
            
            // Engine mode dropdown
            DropdownButtonFormField<String>(
              value: _engineMode,
              decoration: const InputDecoration(labelText: 'OCR Engine Mode'),
              items: const [
                DropdownMenuItem(value: 'fast', child: Text('Fast (Draft)')),
                DropdownMenuItem(value: 'balanced', child: Text('Balanced (Recommended)')),
                DropdownMenuItem(value: 'high_quality', child: Text('High Quality (Accurate)')),
              ],
              onChanged: (val) => setState(() => _engineMode = val ?? 'balanced'),
            ),
            const SizedBox(height: AppTokens.stackLg),
            
            StitchButton(
              type: StitchButtonType.primary,
              text: 'Run OCR Engine',
              onPressed: _selectedFile == null ? null : () => _runOCR(state),
            ),
          ] else if (_isLoading) ...[
            const SizedBox(height: 20),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            const Center(child: Text('Running optical character recognition engine...', style: TextStyle(fontWeight: FontWeight.w500))),
            const SizedBox(height: 10),
          ] else ...[
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: AppTokens.gutter),
            const Center(
              child: Text(
                'OCR processing completed!\nOriginal scanned pages now contain searchable text.',
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
