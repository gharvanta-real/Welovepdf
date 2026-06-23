import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../state/app_state.dart';
import 'sheet_header.dart';

void showSplitSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulSplitSheet();
    },
  );
}

class _StatefulSplitSheet extends StatefulWidget {
  const _StatefulSplitSheet();

  @override
  State<_StatefulSplitSheet> createState() => _StatefulSplitSheetState();
}

class _StatefulSplitSheetState extends State<_StatefulSplitSheet> {
  PlatformFile? _selectedFile;
  String _splitMode = 'all'; // 'all' (split every page) or 'ranges' (custom ranges)
  final TextEditingController _rangeController = TextEditingController(text: '1-3');
  bool _isLoading = false;
  bool _isSuccess = false;
  String _error = '';

  @override
  void dispose() {
    _rangeController.dispose();
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

  Future<void> _runSplit(AppState state) async {
    if (_selectedFile == null) return;
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      await state.processTool('split-pdf', [_selectedFile!], {
        'splitMode': _splitMode,
        'splitRanges': _splitMode == 'all' ? 'all' : _rangeController.text,
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
          buildSheetHeader(context, 'Split PDF Pages'),
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
            
            // Split mode radios
            DropdownButtonFormField<String>(
              value: _splitMode,
              decoration: const InputDecoration(labelText: 'Split Mode'),
              items: const [
                DropdownMenuItem(value: 'all', child: Text('Split all pages into separate PDFs')),
                DropdownMenuItem(value: 'ranges', child: Text('Extract custom page ranges')),
              ],
              onChanged: (val) => setState(() => _splitMode = val ?? 'all'),
            ),
            
            if (_splitMode == 'ranges') ...[
              const SizedBox(height: AppTokens.gutter),
              TextField(
                controller: _rangeController,
                decoration: const InputDecoration(
                  labelText: 'Page Range(s)',
                  hintText: 'e.g. 1-2, 5, 8-10',
                ),
              ),
            ],
            const SizedBox(height: AppTokens.stackLg),
            
            StitchButton(
              type: StitchButtonType.primary,
              text: _splitMode == 'all' ? 'Split All Pages' : 'Extract Range',
              onPressed: _selectedFile == null ? null : () => _runSplit(state),
            ),
          ] else if (_isLoading) ...[
            const SizedBox(height: 20),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            const Center(child: Text('Splitting PDF file and compressing into ZIP...', style: TextStyle(fontWeight: FontWeight.w500))),
            const SizedBox(height: 10),
          ] else ...[
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: AppTokens.gutter),
            const Center(
              child: Text(
                'PDF split successfully!\nOutput saved as ZIP archive.',
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
