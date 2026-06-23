import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../../core/theme/app_tokens.dart';
import '../components/stitch_button.dart';
import '../components/stitch_pdf_badge.dart';
import '../state/app_state.dart';

class FileDetailsScreen extends StatefulWidget {
  const FileDetailsScreen({super.key});

  @override
  State<FileDetailsScreen> createState() => _FileDetailsScreenState();
}

class _FileDetailsScreenState extends State<FileDetailsScreen> {
  late TextEditingController _renameController;

  @override
  void initState() {
    super.initState();
    _renameController = TextEditingController();
  }

  @override
  void dispose() {
    _renameController.dispose();
    super.dispose();
  }

  void _showRenameBottomSheet(BuildContext context, String currentTitle, String id) {
    _renameController.text = currentTitle;
    final state = Provider.of<AppState>(context, listen: false);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
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
              Center(
                child: Container(
                  width: 40,
                  height: 5,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.outlineVariant,
                    borderRadius: BorderRadius.circular(2.5),
                  ),
                ),
              ),
              const SizedBox(height: AppTokens.stackLg),
              Text(
                'Rename Document',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: AppTokens.gutter),
              TextField(
                controller: _renameController,
                decoration: const InputDecoration(
                  hintText: 'Enter new file name',
                ),
                autofocus: true,
              ),
              const SizedBox(height: AppTokens.stackLg),
              Row(
                children: [
                  Expanded(
                    child: StitchButton(
                      type: StitchButtonType.ghost,
                      text: 'Cancel',
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  const SizedBox(width: AppTokens.gutter),
                  Expanded(
                    child: StitchButton(
                      type: StitchButtonType.primary,
                      text: 'Rename',
                      onPressed: () {
                        if (_renameController.text.isNotEmpty) {
                          state.renameDocument(id, _renameController.text);
                        }
                        Navigator.pop(context);
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTokens.stackLg),
            ],
          ),
        );
      },
    );
  }

  void _confirmDeleteBottomSheet(BuildContext context, String id, String title) {
    final state = Provider.of<AppState>(context, listen: false);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTokens.radiusXl)),
          ),
          padding: const EdgeInsets.all(AppTokens.containerPadding),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 5,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.outlineVariant,
                    borderRadius: BorderRadius.circular(2.5),
                  ),
                ),
              ),
              const SizedBox(height: AppTokens.stackLg),
              Text(
                'Delete Document',
                style: theme.textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: AppTokens.gutter),
              Text(
                'Are you sure you want to permanently delete "$title"? This action cannot be undone.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: AppTokens.stackLg),
              Row(
                children: [
                  Expanded(
                    child: StitchButton(
                      type: StitchButtonType.ghost,
                      text: 'Cancel',
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  const SizedBox(width: AppTokens.gutter),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.colorScheme.error,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppTokens.radiusFull),
                        ),
                      ),
                      onPressed: () {
                        state.deleteDocument(id);
                        Navigator.pop(context);
                        state.goBack();
                      },
                      child: const Text('Delete', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTokens.stackLg),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final doc = state.selectedDocument;

    if (doc == null) {
      return const Scaffold(
        body: Center(child: Text('No document selected')),
      );
    }

    final appBarFgColor = theme.appBarTheme.foregroundColor ?? (isDark ? Colors.black : Colors.white);

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: theme.colorScheme.error,
        statusBarIconBrightness: isDark ? Brightness.dark : Brightness.light,
        statusBarBrightness: isDark ? Brightness.light : Brightness.dark,
        systemNavigationBarColor: theme.colorScheme.surface,
        systemNavigationBarIconBrightness: isDark ? Brightness.light : Brightness.dark,
      ),
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: theme.colorScheme.error,
          leading: IconButton(
            onPressed: () {
              state.goBack();
            },
            icon: Icon(Icons.arrow_back, color: appBarFgColor),
          ),
          title: Text(
            'File Details',
            style: TextStyle(fontSize: 18.0, fontWeight: FontWeight.bold, color: appBarFgColor),
          ),
          actions: [
            IconButton(
              onPressed: () => _showRenameBottomSheet(context, doc.title, doc.id),
              icon: Icon(Icons.edit, color: appBarFgColor),
            ),
            IconButton(
              onPressed: () => _confirmDeleteBottomSheet(context, doc.id, doc.title),
              icon: Icon(Icons.delete_outline, color: appBarFgColor),
            ),
          ],
        ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(AppTokens.gutter),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Large Document Preview Block
              Center(
                child: Column(
                  children: [
                    const SizedBox(height: AppTokens.gutter),
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF282828) : theme.colorScheme.secondaryContainer,
                        borderRadius: BorderRadius.circular(AppTokens.radiusXl),
                        boxShadow: const [AppTokens.shadowLevel1],
                      ),
                      alignment: Alignment.center,
                      child: doc.filePath != null && File(doc.filePath!).existsSync()
                          ? ClipRRect(
                              borderRadius: BorderRadius.circular(AppTokens.radiusXl),
                              child: Image.file(
                                File(doc.filePath!),
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                              ),
                            )
                          : StitchPdfBadge(fileType: doc.fileType, scale: 1.8),
                    ),
                    const SizedBox(height: AppTokens.gutter),
                    Text(
                      doc.title,
                      textAlign: TextAlign.center,
                      style: theme.textTheme.headlineMedium?.copyWith(
                        color: theme.colorScheme.onSurface,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: AppTokens.stackSm),
                    Text(
                      '${doc.fileType.toUpperCase()} Document • ${doc.size}',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.colorScheme.onSurfaceVariant.withOpacity(0.8),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppTokens.stackLg * 1.5),

              // Action buttons row (Open, Share, Favorite)
              Row(
                children: [
                  Expanded(
                    child: StitchButton(
                      type: doc.fileType.toLowerCase() == 'pdf'
                          ? StitchButtonType.primary
                          : StitchButtonType.ghost,
                      text: 'Open File',
                      onPressed: () {
                        if (doc.fileType.toLowerCase() == 'pdf') {
                          state.setScreen(AppScreen.pdfViewer);
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: AppTokens.gutter),
                  IconButton(
                    onPressed: () async {
                      if (doc.filePath != null && await File(doc.filePath!).exists()) {
                        await Share.shareXFiles(
                          [XFile(doc.filePath!)],
                          text: doc.title,
                        );
                      } else {
                        await Share.share(
                          '${doc.title}\nFormat: ${doc.fileType.toUpperCase()}\nSize: ${doc.size}\nAuthor: ${doc.author}\nDescription: ${doc.description}',
                          subject: 'Stitch Document Share',
                        );
                      }
                    },
                    style: IconButton.styleFrom(
                      backgroundColor: isDark ? const Color(0xFF282828) : theme.colorScheme.surfaceContainerHighest,
                      padding: const EdgeInsets.all(AppTokens.gutter * 0.8),
                    ),
                    icon: Icon(Icons.share, color: theme.colorScheme.secondary),
                  ),
                  const SizedBox(width: AppTokens.stackMd),
                  IconButton(
                    onPressed: () {
                      state.toggleFavorite(doc.id);
                    },
                    style: IconButton.styleFrom(
                      backgroundColor: doc.isFavorite
                          ? theme.colorScheme.error.withOpacity(0.1)
                          : (isDark ? const Color(0xFF282828) : theme.colorScheme.surfaceContainerHighest),
                      padding: const EdgeInsets.all(AppTokens.gutter * 0.8),
                    ),
                    icon: Icon(
                      doc.isFavorite ? Icons.favorite : Icons.favorite_border,
                      color: doc.isFavorite ? theme.colorScheme.error : theme.colorScheme.secondary,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTokens.stackLg * 1.5),

              // Detail Metadata Fields List (Table-like layout)
              Text(
                'File Metadata',
                style: theme.textTheme.headlineSmall?.copyWith(
                  color: theme.colorScheme.onSurface,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: AppTokens.stackMd),
              Container(
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
                  borderRadius: BorderRadius.circular(AppTokens.radiusLg),
                  border: Border.all(
                    color: theme.colorScheme.outlineVariant.withOpacity(0.3),
                  ),
                  boxShadow: const [AppTokens.shadowLevel1],
                ),
                child: Column(
                  children: [
                    _buildMetadataRow('Format', doc.fileType.toUpperCase()),
                    _buildMetadataRow('File Size', doc.size),
                    _buildMetadataRow('Pages', '${doc.pagesCount} pages'),
                    _buildMetadataRow('Author', doc.author),
                    _buildMetadataRow('Added Date', doc.addedDate),
                    _buildMetadataRow('Description', doc.description, isLast: true),
                  ],
                ),
              ),
              const SizedBox(height: AppTokens.stackLg * 2),
            ],
          ),
        ),
      ),
    ),);
  }

  Widget _buildMetadataRow(String label, String value, {bool isLast = false}) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.all(AppTokens.gutter),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : Border(
                bottom: BorderSide(
                  color: isDark
                      ? const Color(0xFF2C2C2C)
                      : theme.colorScheme.outlineVariant.withOpacity(0.3),
                  width: 1.0,
                ),
              ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: theme.textTheme.labelLarge?.copyWith(
                color: theme.colorScheme.outline,
              ),
            ),
          ),
          const SizedBox(width: AppTokens.stackMd),
          Expanded(
            child: Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
