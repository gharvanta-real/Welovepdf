import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../state/app_state.dart';
import 'sheet_header.dart';

void showMergeSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulMergeSheet();
    },
  );
}

class _StatefulMergeSheet extends StatefulWidget {
  const _StatefulMergeSheet();

  @override
  State<_StatefulMergeSheet> createState() => _StatefulMergeSheetState();
}

class _StatefulMergeSheetState extends State<_StatefulMergeSheet> {
  final List<PlatformFile> _selectedFiles = [];
  bool _isLoading = false;
  bool _isSuccess = false;
  String _error = '';
  String _outputName = 'Merged_Document.pdf';

  Future<void> _pickFiles() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        allowMultiple: true,
      );
      if (result != null) {
        setState(() {
          _selectedFiles.addAll(result.files);
        });
      }
    } catch (e) {
      setState(() => _error = 'Error picking files: $e');
    }
  }

  Future<void> _runMerge(AppState state) async {
    if (_selectedFiles.length < 2) return;
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final cleanOutputName = _outputName.endsWith('.pdf') ? _outputName : '$_outputName.pdf';
      await state.processTool('merge-pdf', _selectedFiles, {
        'fileNameStamps': 'false',
        'includeTOC': 'false',
        'outputName': cleanOutputName,
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
          buildSheetHeader(context, 'Merge Multiple PDFs'),
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
            const Text('Select 2 or more PDF documents to merge together:'),
            const SizedBox(height: AppTokens.stackMd),
            
            // Files selected section
            if (_selectedFiles.isNotEmpty) ...[
              Container(
                constraints: const BoxConstraints(maxHeight: 180),
                decoration: BoxDecoration(
                  border: Border.all(color: theme.colorScheme.outlineVariant),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: _selectedFiles.length,
                  itemBuilder: (context, index) {
                    final file = _selectedFiles[index];
                    return ListTile(
                      dense: true,
                      leading: const Icon(Icons.picture_as_pdf, color: Colors.red),
                      title: Text(file.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                      subtitle: Text('${(file.size / 1024 / 1024).toStringAsFixed(2)} MB'),
                      trailing: IconButton(
                        icon: const Icon(Icons.close, size: 18),
                        onPressed: () {
                          setState(() {
                            _selectedFiles.removeAt(index);
                          });
                        },
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: AppTokens.gutter),
            ],
            
            // Picker buttons
            Row(
              children: [
                Expanded(
                  child: StitchButton(
                    type: StitchButtonType.secondary,
                    text: _selectedFiles.isEmpty ? 'Select PDFs' : 'Add More PDFs',
                    onPressed: _pickFiles,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTokens.gutter),
            
            // Output name field
            TextField(
              decoration: const InputDecoration(
                labelText: 'Output File Name',
                hintText: 'Enter name for merged file',
              ),
              onChanged: (val) => _outputName = val,
              controller: TextEditingController(text: _outputName)..selection = TextSelection.fromPosition(TextPosition(offset: _outputName.length)),
            ),
            const SizedBox(height: AppTokens.stackLg),
            
            StitchButton(
              type: StitchButtonType.primary,
              text: 'Merge Files (${_selectedFiles.length} Selected)',
              onPressed: _selectedFiles.length < 2 ? null : () => _runMerge(state),
            ),
          ] else if (_isLoading) ...[
            const SizedBox(height: 20),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            const Center(child: Text('Merging files and creating new document...', style: TextStyle(fontWeight: FontWeight.w500))),
            const SizedBox(height: 10),
          ] else ...[
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: AppTokens.gutter),
            Center(
              child: Text(
                'Files merged successfully!\nCreated "${_outputName.endsWith('.pdf') ? _outputName : '$_outputName.pdf'}"',
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
