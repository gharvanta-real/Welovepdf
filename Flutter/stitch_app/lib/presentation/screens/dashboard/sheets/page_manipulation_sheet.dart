import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../state/app_state.dart';
import 'sheet_header.dart';

void showPageManipulationSheet(BuildContext context, String actionType) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return _StatefulPageManipulationSheet(actionType: actionType);
    },
  );
}

class _StatefulPageManipulationSheet extends StatefulWidget {
  final String actionType; // 'Rotate', 'Delete', 'Extract', 'Reorder'
  const _StatefulPageManipulationSheet({required this.actionType});

  @override
  State<_StatefulPageManipulationSheet> createState() => _StatefulPageManipulationSheetState();
}

class _StatefulPageManipulationSheetState extends State<_StatefulPageManipulationSheet> {
  PlatformFile? _selectedFile;
  final TextEditingController _pagesController = TextEditingController();
  int _rotateAngle = 90;
  bool _isLoading = false;
  bool _isSuccess = false;
  String _error = '';

  @override
  void dispose() {
    _pagesController.dispose();
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

  Future<void> _runAction(AppState state) async {
    if (_selectedFile == null) return;
    setState(() {
      _isLoading = true;
      _error = '';
    });

    String toolId = 'rotate-pdf';
    Map<String, dynamic> options = {};

    if (widget.actionType == 'Rotate') {
      toolId = 'rotate-pdf';
      options = {
        'rotateAngle': _rotateAngle.toString(),
        'rotatePages': 'all', // apply rotation to all pages
      };
    } else if (widget.actionType == 'Delete') {
      toolId = 'remove-pages';
      options = {
        'removePages': _pagesController.text, // e.g. "1,2,5"
      };
    } else if (widget.actionType == 'Extract') {
      toolId = 'extract-pages';
      options = {
        'extractPages': _pagesController.text, // e.g. "2-5"
      };
    } else if (widget.actionType == 'Reorder') {
      toolId = 'organize-pdf';
      options = {
        'pageOrder': _pagesController.text, // e.g. "3,1,2"
      };
    }

    try {
      await state.processTool(toolId, [_selectedFile!], options);
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
          buildSheetHeader(context, '${widget.actionType} PDF Pages'),
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
            
            if (widget.actionType == 'Rotate') ...[
              DropdownButtonFormField<int>(
                value: _rotateAngle,
                decoration: const InputDecoration(labelText: 'Rotation Angle'),
                items: const [
                  DropdownMenuItem(value: 90, child: Text('90° Clockwise')),
                  DropdownMenuItem(value: 180, child: Text('180° Flip')),
                  DropdownMenuItem(value: 270, child: Text('270° Counter-Clockwise')),
                ],
                onChanged: (val) => setState(() => _rotateAngle = val ?? 90),
              ),
            ] else if (widget.actionType == 'Delete') ...[
              TextField(
                controller: _pagesController,
                decoration: const InputDecoration(
                  labelText: 'Pages to Delete',
                  hintText: 'e.g. 1, 2, 5 (comma-separated)',
                ),
              ),
            ] else if (widget.actionType == 'Extract') ...[
              TextField(
                controller: _pagesController,
                decoration: const InputDecoration(
                  labelText: 'Pages to Extract',
                  hintText: 'e.g. 2-5, 7, 9 (ranges or numbers)',
                ),
              ),
            ] else if (widget.actionType == 'Reorder') ...[
              TextField(
                controller: _pagesController,
                decoration: const InputDecoration(
                  labelText: 'New Page Order',
                  hintText: 'e.g. 3, 1, 2, 4 (comma-separated)',
                ),
              ),
            ],
            const SizedBox(height: AppTokens.stackLg),
            StitchButton(
              type: StitchButtonType.primary,
              text: 'Run Page manipulation',
              onPressed: _selectedFile == null ? null : () => _runAction(state),
            ),
          ] else if (_isLoading) ...[
            const SizedBox(height: 20),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            const Center(child: Text('Manipulating PDF page layout...', style: TextStyle(fontWeight: FontWeight.w500))),
            const SizedBox(height: 10),
          ] else ...[
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: AppTokens.gutter),
            const Center(
              child: Text(
                'Page manipulation completed successfully!\nOutput file added to workspace.',
                textAlign: TextAlign.center,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
