import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../data/engines/pdf_word_count_engine.dart';
import '../../../components/stitch_button.dart';
import '../../../components/stitch_input.dart';
import 'sheet_header.dart';

void showWordCountSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulWordCountSheet();
    },
  );
}

class _StatefulWordCountSheet extends StatefulWidget {
  const _StatefulWordCountSheet();

  @override
  State<_StatefulWordCountSheet> createState() => _StatefulWordCountSheetState();
}

class _StatefulWordCountSheetState extends State<_StatefulWordCountSheet> {
  PlatformFile? _selectedFile;
  final _searchController = TextEditingController();
  bool _isLoading = false;
  bool _isSuccess = false;
  String _error = '';

  // Stats results
  int _wordCount = 0;
  int _charCount = 0;
  int _keywordOccurrences = 0;

  Future<void> _pickFile() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
      );
      if (result != null && result.files.isNotEmpty) {
        setState(() {
          _selectedFile = result.files.first;
          _isSuccess = false;
        });
      }
    } catch (e) {
      setState(() => _error = 'Error picking file: $e');
    }
  }

  Future<void> _runCounter() async {
    if (_selectedFile == null) return;
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final stats = await PdfWordCountEngine.count(file: _selectedFile!);
      if (mounted) {
        final query = _searchController.text.trim().toLowerCase();
        int keywordCount = 0;
        if (query.isNotEmpty && stats['text'] != null) {
          final text = (stats['text'] as String).toLowerCase();
          int index = 0;
          while ((index = text.indexOf(query, index)) != -1) {
            keywordCount++;
            index += query.length;
          }
        }

        setState(() {
          _isLoading = false;
          _isSuccess = true;
          _wordCount = stats['wordCount'] as int;
          _charCount = stats['characterCount'] as int;
          _keywordOccurrences = keywordCount;
        });
        HapticFeedback.mediumImpact();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = 'Failed to count words: $e';
        });
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
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
          buildSheetHeader(context, 'PDF Word & Text Counter'),
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
                    const Icon(Icons.picture_as_pdf_rounded, color: Colors.red, size: 36),
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
                            const Text('Select .pdf file from storage'),
                        ],
                      ),
                    ),
                    const Icon(Icons.keyboard_arrow_right),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTokens.stackLg),
            StitchTextField(
              controller: _searchController,
              labelText: 'Search Keyword/Phrase (Optional)',
              hintText: 'Enter keyword to count occurrences',
            ),
            const SizedBox(height: AppTokens.stackLg),
            StitchButton(
              text: 'Analyze Document',
              onPressed: _selectedFile == null ? null : _runCounter,
            ),
          ] else if (_isLoading) ...[
            const SizedBox(height: 20),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            const Center(
              child: Text(
                'Parsing PDF layout and indexing text content...',
                style: TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
            const SizedBox(height: 10),
          ] else ...[
            Icon(Icons.analytics_rounded, color: theme.colorScheme.primary, size: 54),
            const SizedBox(height: AppTokens.stackMd),
            Text(
              'PDF Text Statistics',
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: AppTokens.stackLg),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? const Color(0xFF282828) : const Color(0xFFF9F9F9),
                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
              ),
              child: Column(
                children: [
                  _buildStatRow(theme, 'Total Word Count', '$_wordCount words'),
                  const Divider(height: 16),
                  _buildStatRow(theme, 'Total Characters', '$_charCount chars'),
                  if (_searchController.text.trim().isNotEmpty) ...[
                    const Divider(height: 16),
                    _buildStatRow(
                      theme,
                      'Occurrences of "${_searchController.text.trim()}"',
                      '$_keywordOccurrences times',
                      highlight: true,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: AppTokens.stackLg * 1.5),
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
                    text: 'Close',
                    onPressed: () => Navigator.pop(context),
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

  Widget _buildStatRow(ThemeData theme, String label, String value, {bool highlight = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w500)),
        Text(
          value,
          style: theme.textTheme.bodyLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: highlight ? theme.colorScheme.error : theme.colorScheme.onSurface,
          ),
        ),
      ],
    );
  }
}
