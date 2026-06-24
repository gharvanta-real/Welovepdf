import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_tokens.dart';
import '../components/stitch_input.dart';
import '../state/app_state.dart';

class ScanPreviewScreen extends StatefulWidget {
  const ScanPreviewScreen({super.key});

  @override
  State<ScanPreviewScreen> createState() => _ScanPreviewScreenState();
}

class _ScanPreviewScreenState extends State<ScanPreviewScreen> {
  late TextEditingController _titleController;

  @override
  void initState() {
    super.initState();
    final state = Provider.of<AppState>(context, listen: false);
    _titleController = TextEditingController(text: state.scannedTitle);
  }

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Sync state title if needed
    if (_titleController.text != state.scannedTitle) {
      _titleController.text = state.scannedTitle;
    }

    const appBarBgColor = Color(0xFF1A73E8);
    const appBarFgColor = Colors.white;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: appBarBgColor,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: theme.colorScheme.surface,
        systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: isDark ? AppTokens.backgroundDark : AppTokens.backgroundLight,
        appBar: AppBar(
          backgroundColor: appBarBgColor,
          foregroundColor: appBarFgColor,
          elevation: 0,
          leading: IconButton(
            onPressed: () {
              state.goBack();
            },
            icon: const Icon(Icons.arrow_back, color: appBarFgColor),
          ),
          title: const Text(
            'Save Document',
            style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold, color: appBarFgColor),
          ),
          actions: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: TextButton(
                onPressed: () {
                  HapticFeedback.heavyImpact();
                  state.updateScannedTitle(_titleController.text);
                  state.saveScannedDocument();
                },
                child: const Text(
                  'Save',
                  style: TextStyle(
                    color: appBarFgColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          ],
        ),
      body: state.scannedPages.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.document_scanner_outlined, color: Colors.grey.withOpacity(0.5), size: 64),
                  const SizedBox(height: AppTokens.stackMd),
                  const Text('No pages scanned yet.', style: TextStyle(color: Colors.grey)),
                  const SizedBox(height: AppTokens.stackLg),
                  ElevatedButton.icon(
                    onPressed: () => state.startScanFlow(context),
                    icon: const Icon(Icons.camera_alt_outlined),
                    label: const Text('Open Camera'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.error,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                  ),
                ],
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(AppTokens.gutter),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Title Editor Field
                  StitchTextField(
                    controller: _titleController,
                    labelText: 'Document Name',
                    onChanged: (val) {
                      state.updateScannedTitle(val);
                    },
                  ),
                  const SizedBox(height: AppTokens.stackMd),

                  // Brief info card
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                      borderRadius: BorderRadius.circular(AppTokens.radiusDefault),
                      border: Border.all(
                        color: theme.colorScheme.outlineVariant.withOpacity(0.2),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline_rounded, color: theme.colorScheme.primary, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'All cropping and perspective adjustments are saved directly.',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppTokens.stackLg),

                  // Grid of Scanned Pages
                  Expanded(
                    child: GridView.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: AppTokens.gutter,
                        mainAxisSpacing: AppTokens.gutter,
                        childAspectRatio: 0.72,
                      ),
                      itemCount: state.scannedPages.length,
                      itemBuilder: (context, index) {
                        final page = state.scannedPages[index];
                        return Stack(
                          children: [
                            Container(
                              decoration: BoxDecoration(
                                color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                                borderRadius: BorderRadius.circular(AppTokens.radiusMd),
                                border: Border.all(
                                  color: theme.colorScheme.outlineVariant.withOpacity(0.3),
                                ),
                                boxShadow: const [AppTokens.shadowLevel1],
                              ),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(AppTokens.radiusMd - 1),
                                child: Image.memory(
                                  page.imageBytes,
                                  fit: BoxFit.cover,
                                  width: double.infinity,
                                  height: double.infinity,
                                ),
                              ),
                            ),
                            Positioned(
                              left: 8,
                              top: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                decoration: BoxDecoration(
                                  color: Colors.black.withOpacity(0.6),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  'Page ${index + 1}',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: AppTokens.stackLg),

                  // Bottom Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            HapticFeedback.selectionClick();
                            state.startScanFlow(context);
                          },
                          icon: const Icon(Icons.refresh_rounded),
                          label: const Text('Retake Scan'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: theme.colorScheme.error,
                            side: BorderSide(color: theme.colorScheme.error),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(AppTokens.radiusFull),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: theme.colorScheme.error,
                            borderRadius: BorderRadius.circular(AppTokens.radiusFull),
                            boxShadow: [
                              BoxShadow(
                                color: theme.colorScheme.error.withOpacity(0.3),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ElevatedButton.icon(
                            onPressed: () {
                              HapticFeedback.heavyImpact();
                              state.updateScannedTitle(_titleController.text);
                              state.saveScannedDocument();
                            },
                            icon: const Icon(Icons.picture_as_pdf_rounded),
                            label: const Text('Save PDF'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              foregroundColor: isDark ? Colors.black : Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(AppTokens.radiusFull),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    ),);
  }
}
