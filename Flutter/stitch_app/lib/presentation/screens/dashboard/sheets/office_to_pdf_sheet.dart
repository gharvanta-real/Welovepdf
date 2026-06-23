import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../state/app_state.dart';
import 'sheet_header.dart';

void showOfficeToPdfSheet(BuildContext context, String sourceFormat) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return _StatefulOfficeToPdfSheet(sourceFormat: sourceFormat);
    },
  );
}

class _StatefulOfficeToPdfSheet extends StatefulWidget {
  final String sourceFormat; // 'Excel' or 'PPT'
  const _StatefulOfficeToPdfSheet({required this.sourceFormat});

  @override
  State<_StatefulOfficeToPdfSheet> createState() => _StatefulOfficeToPdfSheetState();
}

class _StatefulOfficeToPdfSheetState extends State<_StatefulOfficeToPdfSheet> {
  PlatformFile? _selectedFile;
  bool _isLoading = false;
  bool _isSuccess = false;
  String _error = '';

  Future<void> _pickFile() async {
    final extensions = widget.sourceFormat == 'Excel' ? ['xlsx', 'xls'] : ['pptx', 'ppt'];
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: extensions,
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

    final toolId = widget.sourceFormat == 'Excel' ? 'excel-to-pdf' : 'ppt-to-pdf';

    try {
      await state.processTool(toolId, [_selectedFile!], {
        'pageOrientation': 'portrait',
        'pageSize': 'a4',
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

    final IconData icon = widget.sourceFormat == 'Excel' ? Icons.table_chart : Icons.slideshow;
    final Color iconColor = widget.sourceFormat == 'Excel' ? Colors.green : Colors.orange;

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
          buildSheetHeader(context, '${widget.sourceFormat} to PDF Converter'),
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
                    Icon(icon, color: iconColor, size: 36),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _selectedFile?.name ?? 'Tap to select ${widget.sourceFormat} file',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (_selectedFile != null)
                            Text('${(_selectedFile!.size / 1024 / 1024).toStringAsFixed(2)} MB')
                          else
                            Text('Select file from device storage'),
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
              text: 'Convert to PDF',
              onPressed: _selectedFile == null ? null : () => _runConversion(state),
            ),
          ] else if (_isLoading) ...[
            const SizedBox(height: 20),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            Center(child: Text('Converting ${widget.sourceFormat} layout to PDF format...', style: const TextStyle(fontWeight: FontWeight.w500))),
            const SizedBox(height: 10),
          ] else ...[
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: AppTokens.gutter),
            const Center(
              child: Text(
                'Converted to PDF format successfully!\nSaved to your workspace files.',
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
