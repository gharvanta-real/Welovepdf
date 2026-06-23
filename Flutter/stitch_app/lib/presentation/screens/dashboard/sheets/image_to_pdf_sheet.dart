import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../components/stitch_button.dart';
import '../../../state/app_state.dart';
import 'sheet_header.dart';

void showImageToPdfSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return const _StatefulImageToPdfSheet();
    },
  );
}

class _StatefulImageToPdfSheet extends StatefulWidget {
  const _StatefulImageToPdfSheet();

  @override
  State<_StatefulImageToPdfSheet> createState() => _StatefulImageToPdfSheetState();
}

class _StatefulImageToPdfSheetState extends State<_StatefulImageToPdfSheet> {
  final List<PlatformFile> _selectedImages = [];
  final TextEditingController _nameController = TextEditingController(text: 'Images_Compiled');
  bool _isLoading = false;
  bool _isSuccess = false;
  String _error = '';

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  Future<void> _pickImages() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.image,
        allowMultiple: true,
      );
      if (result != null) {
        setState(() {
          _selectedImages.addAll(result.files);
        });
      }
    } catch (e) {
      setState(() => _error = 'Error picking images: $e');
    }
  }

  Future<void> _runCompilation(AppState state) async {
    if (_selectedImages.isEmpty || _nameController.text.isEmpty) return;
    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final cleanOutputName = _nameController.text.endsWith('.pdf') ? _nameController.text : '${_nameController.text}.pdf';
      await state.processTool('jpg-to-pdf', _selectedImages, {
        'pageOrientation': 'portrait',
        'pageSize': 'a4',
        'pageMargin': 'none',
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
          buildSheetHeader(context, 'Convert Images to PDF'),
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
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Output File Name'),
            ),
            const SizedBox(height: AppTokens.gutter),
            
            if (_selectedImages.isNotEmpty) ...[
              Container(
                constraints: const BoxConstraints(maxHeight: 120),
                decoration: BoxDecoration(
                  border: Border.all(color: theme.colorScheme.outlineVariant),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: _selectedImages.length,
                  itemBuilder: (context, index) {
                    final img = _selectedImages[index];
                    return ListTile(
                      dense: true,
                      leading: const Icon(Icons.image, color: Colors.purple),
                      title: Text(img.name, maxLines: 1, overflow: TextOverflow.ellipsis),
                      trailing: IconButton(
                        icon: const Icon(Icons.close, size: 16),
                        onPressed: () {
                          setState(() {
                            _selectedImages.removeAt(index);
                          });
                        },
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: AppTokens.gutter),
            ],
            
            Row(
              children: [
                Expanded(
                  child: StitchButton(
                    type: StitchButtonType.secondary,
                    text: _selectedImages.isEmpty ? 'Select Images' : 'Add More Images',
                    onPressed: _pickImages,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTokens.stackLg),
            
            StitchButton(
              type: StitchButtonType.primary,
              text: 'Compile to PDF (${_selectedImages.length} Selected)',
              onPressed: _selectedImages.isEmpty || _nameController.text.isEmpty ? null : () => _runCompilation(state),
            ),
          ] else if (_isLoading) ...[
            const SizedBox(height: 20),
            const Center(child: CircularProgressIndicator()),
            const SizedBox(height: 20),
            const Center(child: Text('Compiling photos into a high-quality PDF...', style: TextStyle(fontWeight: FontWeight.w500))),
            const SizedBox(height: 10),
          ] else ...[
            const Icon(Icons.check_circle, color: Colors.green, size: 48),
            const SizedBox(height: AppTokens.gutter),
            const Center(
              child: Text(
                'Photos compiled into PDF successfully!\nAdded to your dashboard files.',
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
