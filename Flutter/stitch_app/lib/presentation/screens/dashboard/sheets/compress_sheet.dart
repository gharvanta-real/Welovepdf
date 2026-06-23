import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../state/app_state.dart';
import 'sheet_header.dart';

void showCompressSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulCompressSheet();
    },
  );
}

class _StatefulCompressSheet extends StatefulWidget {
  const _StatefulCompressSheet();

  @override
  State<_StatefulCompressSheet> createState() => _StatefulCompressSheetState();
}

class _StatefulCompressSheetState extends State<_StatefulCompressSheet> {
  PlatformFile? _selectedFile;
  String _level = 'Medium';
  bool _isLoading = false;
  bool _isSuccess = false;
  String _error = '';
  String _compressedSize = '';

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

  Future<void> _runCompress(AppState state) async {
    if (_selectedFile == null) return;
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      // Map UI compression level to what backend expects (e.g. low, medium, high)
      final String mappedLevel = _level.toLowerCase();
      
      final resultDoc = await state.processTool('compress-pdf', [_selectedFile!], {
        'compressionLevel': mappedLevel,
      });

      setState(() {
        _isLoading = false;
        _isSuccess = true;
        _compressedSize = resultDoc?.size ?? 'Unknown size';
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
          buildSheetHeader(context, 'Compress PDF File'),
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
            // Select file card
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
            
            // Compression level dropdown
            DropdownButtonFormField<String>(
              value: _level,
              isExpanded: true,
              decoration: const InputDecoration(
                labelText: 'Compression Level',
              ),
              items: ['Low', 'Medium', 'High'].map((l) {
                String subText = '';
                if (l == 'Low') subText = ' (High quality, larger)';
                if (l == 'Medium') subText = ' (Balanced size/quality)';
                if (l == 'High') subText = ' (Smallest size, lower quality)';
                return DropdownMenuItem(
                  value: l,
                  child: Text(
                    '$l Compression$subText',
                    overflow: TextOverflow.ellipsis,
                  ),
                );
              }).toList(),
              onChanged: (val) => setState(() => _level = val ?? 'Medium'),
            ),
            const SizedBox(height: AppTokens.stackLg),
            
            StitchButton(
              type: StitchButtonType.primary,
              text: 'Compress File',
              onPressed: _selectedFile == null ? null : () => _runCompress(state),
            ),
          ] else if (_isLoading) ...[
            const SizedBox(height: 20),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            const Center(child: Text('Compressing PDF file...', style: TextStyle(fontWeight: FontWeight.w500))),
            const SizedBox(height: 10),
          ] else ...[
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: AppTokens.gutter),
            Center(
              child: Text(
                'PDF compressed successfully!\nNew size: $_compressedSize',
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
