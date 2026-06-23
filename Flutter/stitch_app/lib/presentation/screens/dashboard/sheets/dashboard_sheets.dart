import 'dart:io';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../core/theme/app_tokens.dart';
import '../../../../data/models/document.dart';
import '../../../components/stitch_button.dart';
import '../../../components/stitch_pdf_badge.dart';
import '../../../state/app_state.dart';

void showCreateFolderBottomSheet(BuildContext context, AppState state) {
  final controller = TextEditingController();
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
              'Create New Folder',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: AppTokens.gutter),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: 'Enter folder name',
                prefixIcon: Icon(Icons.folder),
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
                    text: 'Create',
                    onPressed: () {
                      if (controller.text.isNotEmpty) {
                        state.createMockFolder(controller.text);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Folder "${controller.text}" created successfully!')),
                        );
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

void showUploadFileBottomSheet(BuildContext context, AppState state) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      return StatefulBuilder(
        builder: (context, setDialogState) {
          PlatformFile? selectedFile;
          bool isUploading = false;
          String errorMsg = '';

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
                  'Upload Local Document',
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: AppTokens.gutter),
                
                if (errorMsg.isNotEmpty) ...[
                  Text(errorMsg, style: TextStyle(color: theme.colorScheme.error)),
                  const SizedBox(height: AppTokens.gutter),
                ],

                if (!isUploading) ...[
                  // File Picker Block
                  GestureDetector(
                    onTap: () async {
                      try {
                        final result = await FilePicker.platform.pickFiles(
                          type: FileType.custom,
                          allowedExtensions: ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'jpg', 'jpeg', 'png', 'txt'],
                        );
                        if (result != null && result.files.isNotEmpty) {
                          setDialogState(() {
                            selectedFile = result.files.first;
                          });
                        }
                      } catch (e) {
                        setDialogState(() {
                          errorMsg = 'Error picking file: $e';
                        });
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                      decoration: BoxDecoration(
                        border: Border.all(color: theme.colorScheme.outlineVariant),
                        borderRadius: BorderRadius.circular(8),
                        color: isDark ? Colors.black12 : Colors.grey[50],
                      ),
                      child: Column(
                        children: [
                          Icon(Icons.cloud_upload_outlined, size: 48, color: theme.colorScheme.primary),
                          const SizedBox(height: 12),
                          Text(
                            selectedFile?.name ?? 'Tap to select file from storage',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                            textAlign: TextAlign.center,
                          ),
                          if (selectedFile != null) ...[
                            const SizedBox(height: 4),
                            Text('${(selectedFile!.size / 1024 / 1024).toStringAsFixed(2)} MB'),
                          ],
                        ],
                      ),
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
                        child: StitchButton(
                          type: StitchButtonType.primary,
                          text: 'Add to Dashboard',
                          onPressed: selectedFile == null
                              ? null
                              : () async {
                                  setDialogState(() {
                                    isUploading = true;
                                  });
                                  final newDoc = await state.addRealDocument(selectedFile!);
                                  if (newDoc != null) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text('File "${selectedFile!.name}" added!')),
                                    );
                                  } else {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(content: Text('Failed to add document.')),
                                    );
                                  }
                                  Navigator.pop(context);
                                },
                        ),
                      ),
                    ],
                  ),
                ] else ...[
                  const SizedBox(height: 20),
                  const Center(child: CircularProgressIndicator()),
                  const SizedBox(height: 20),
                  const Center(child: Text('Uploading file to dashboard...')),
                ],
                const SizedBox(height: AppTokens.stackLg),
              ],
            ),
          );
        },
      );
    },
  );
}

void showRenameDialog(BuildContext context, Document doc, AppState state) {
  final controller = TextEditingController(text: doc.title);
  showDialog(
    context: context,
    builder: (context) {
      return AlertDialog(
        title: Text('Rename ${doc.fileType == 'folder' ? 'Folder' : 'Document'}'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            hintText: 'Enter new name',
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                state.renameDocument(doc.id, controller.text);
              }
              Navigator.pop(context);
            },
            child: const Text('Rename'),
          ),
        ],
      );
    },
  );
}

void showSortBottomSheet(BuildContext context, AppState state) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      final currentSort = state.sortBy;

      Widget sortItem(String label, String criteria, IconData icon) {
        final isSelected = currentSort == criteria;
        return ListTile(
          leading: Icon(icon, color: isSelected ? theme.colorScheme.error : theme.colorScheme.secondary),
          title: Text(
            label,
            style: TextStyle(
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: isSelected ? theme.colorScheme.error : theme.colorScheme.onSurface,
            ),
          ),
          trailing: isSelected ? Icon(Icons.check, color: theme.colorScheme.error) : null,
          onTap: () {
            state.updateSortBy(criteria);
            Navigator.pop(context);
          },
        );
      }

      return Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTokens.radiusXl)),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppTokens.containerPadding,
          vertical: AppTokens.containerPadding,
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
              'Sort Documents By',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
                color: theme.colorScheme.onSurface,
              ),
            ),
            const SizedBox(height: AppTokens.stackMd),
            const Divider(),
            Flexible(
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    sortItem('Date Added (Newest first)', 'date_desc', Icons.date_range),
                    sortItem('Date Added (Oldest first)', 'date_asc', Icons.history),
                    sortItem('Name (A to Z)', 'name_asc', Icons.sort_by_alpha),
                    sortItem('Name (Z to A)', 'name_desc', Icons.sort_by_alpha),
                    sortItem('Size (Largest first)', 'size_desc', Icons.arrow_downward),
                    sortItem('Size (Smallest first)', 'size_asc', Icons.arrow_upward),
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTokens.stackSm),
          ],
        ),
      );
    },
  );
}

void showFolderPickerBottomSheet(BuildContext context, AppState state, Document doc, {required bool isMove}) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  // Get all folders, excluding the document itself if it's a folder (to prevent moving inside itself)
  final allFolders = state.folders.where((f) => f.id != doc.id).toList();

  showModalBottomSheet(
    context: context,
    backgroundColor: Colors.transparent,
    isScrollControlled: true,
    builder: (context) {
      return DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) {
          return Container(
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTokens.radiusXl)),
            ),
            padding: const EdgeInsets.all(AppTokens.containerPadding),
            child: Column(
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
                  '${isMove ? 'Move' : 'Copy'} "${doc.title}" to Folder',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: AppTokens.stackMd),
                const Divider(),
                Expanded(
                  child: ListView(
                    controller: scrollController,
                    children: [
                      // Option for Root directory
                      ListTile(
                        leading: Icon(Icons.home, color: theme.colorScheme.secondary),
                        title: Text(
                          'Root (Main Directory)',
                          style: TextStyle(
                            fontWeight: doc.parentFolderId == null ? FontWeight.bold : FontWeight.normal,
                            color: theme.colorScheme.onSurface,
                          ),
                        ),
                        trailing: doc.parentFolderId == null
                            ? Icon(Icons.check, color: theme.colorScheme.secondary)
                            : null,
                        onTap: () {
                          if (isMove) {
                            state.moveDocument(doc.id, null);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Moved "${doc.title}" to Root.')),
                            );
                          } else {
                            state.copyDocument(doc.id, null);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(content: Text('Copied "${doc.title}" to Root.')),
                            );
                          }
                          Navigator.pop(context);
                        },
                      ),
                      const Divider(),
                      if (allFolders.isEmpty)
                        Padding(
                          padding: const EdgeInsets.all(AppTokens.gutter * 1.5),
                          child: Center(
                            child: Text(
                              'No other folders available.',
                              style: TextStyle(color: theme.colorScheme.outline),
                            ),
                          ),
                        )
                      else
                        ...allFolders.map((folder) {
                          final isCurrentParent = doc.parentFolderId == folder.id;
                          return ListTile(
                            leading: const Icon(Icons.folder, color: Colors.amber),
                            title: Text(
                              folder.title,
                              style: TextStyle(
                                fontWeight: isCurrentParent ? FontWeight.bold : FontWeight.normal,
                                color: theme.colorScheme.onSurface,
                              ),
                            ),
                            trailing: isCurrentParent
                                ? Icon(Icons.check, color: theme.colorScheme.secondary)
                                : null,
                            onTap: () {
                              if (isMove) {
                                state.moveDocument(doc.id, folder.id);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Moved "${doc.title}" to "${folder.title}".')),
                                );
                              } else {
                                state.copyDocument(doc.id, folder.id);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Copied "${doc.title}" to "${folder.title}".')),
                                );
                              }
                              Navigator.pop(context);
                            },
                          );
                        }),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      );
    },
  );
}

void showDocumentOptionsBottomSheet(BuildContext context, Document doc, AppState state) {
  final theme = Theme.of(context);
  final isDark = theme.brightness == Brightness.dark;

  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) {
      final isFavorite = doc.isFavorite;
      final isFolder = doc.fileType == 'folder';

      return Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTokens.radiusXl)),
        ),
        padding: const EdgeInsets.symmetric(
          horizontal: AppTokens.containerPadding,
          vertical: AppTokens.containerPadding,
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
            // Header showing Title & Type
            Row(
              children: [
                StitchPdfBadge(fileType: doc.fileType, scale: 1.3),
                const SizedBox(width: AppTokens.gutter),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        doc.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: theme.colorScheme.onSurface,
                        ),
                      ),
                      const SizedBox(height: AppTokens.stackSm),
                      Text(
                        isFolder 
                          ? 'Folder • ${state.getAllFolderItemsCount(doc.id)} items'
                          : '${doc.fileType.toUpperCase()} • ${doc.size}',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppTokens.gutter),
            const Divider(),
            const SizedBox(height: AppTokens.stackSm),
            
            Flexible(
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isFolder) ...[
                      // Folder Options
                      _buildOptionRow(
                        context,
                        icon: Icons.folder_open,
                        label: 'Open Folder',
                        onTap: () {
                          Navigator.pop(context);
                          state.openFolder(doc.id);
                        },
                      ),
                      _buildOptionRow(
                        context,
                        icon: Icons.edit_outlined,
                        label: 'Rename Folder',
                        onTap: () {
                          Navigator.pop(context);
                          showRenameDialog(context, doc, state);
                        },
                      ),
                      _buildOptionRow(
                        context,
                        icon: Icons.delete_outline,
                        iconColor: theme.colorScheme.error,
                        label: 'Delete Folder',
                        onTap: () {
                          Navigator.pop(context);
                          state.deleteDocument(doc.id);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Folder "${doc.title}" deleted.')),
                          );
                        },
                      ),
                    ] else ...[
                      // File Options
                      _buildOptionRow(
                        context,
                        icon: Icons.open_in_new,
                        label: 'Open Document',
                        onTap: () {
                          Navigator.pop(context);
                          state.selectDocument(doc);
                          if (doc.fileType.toLowerCase() == 'pdf') {
                            state.setScreen(AppScreen.pdfViewer);
                          } else {
                            state.setScreen(AppScreen.fileDetails);
                          }
                        },
                      ),
                      _buildOptionRow(
                        context,
                        icon: Icons.share_outlined,
                        label: 'Share File',
                        onTap: () async {
                          Navigator.pop(context);
                          if (doc.filePath != null && await File(doc.filePath!).exists()) {
                            await Share.shareXFiles([XFile(doc.filePath!)], text: doc.title);
                          } else {
                            await Share.share(
                              '${doc.title}\nFormat: ${doc.fileType.toUpperCase()}\nSize: ${doc.size}',
                              subject: 'PDFmount Document Share',
                            );
                          }
                        },
                      ),
                      _buildOptionRow(
                        context,
                        icon: isFavorite ? Icons.favorite : Icons.favorite_border,
                        iconColor: isFavorite ? theme.colorScheme.error : null,
                        label: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
                        onTap: () {
                          Navigator.pop(context);
                          state.toggleFavorite(doc.id);
                        },
                      ),
                      _buildOptionRow(
                        context,
                        icon: Icons.drive_file_move_outlined,
                        label: 'Move to Folder',
                        onTap: () {
                          Navigator.pop(context);
                          showFolderPickerBottomSheet(context, state, doc, isMove: true);
                        },
                      ),
                      _buildOptionRow(
                        context,
                        icon: Icons.file_copy_outlined,
                        label: 'Copy to Folder',
                        onTap: () {
                          Navigator.pop(context);
                          showFolderPickerBottomSheet(context, state, doc, isMove: false);
                        },
                      ),
                      _buildOptionRow(
                        context,
                        icon: Icons.edit_outlined,
                        label: 'Rename File',
                        onTap: () {
                          Navigator.pop(context);
                          showRenameDialog(context, doc, state);
                        },
                      ),
                      _buildOptionRow(
                        context,
                        icon: Icons.info_outline,
                        label: 'File Details',
                        onTap: () {
                          Navigator.pop(context);
                          state.selectDocument(doc);
                          state.setScreen(AppScreen.fileDetails);
                        },
                      ),
                      _buildOptionRow(
                        context,
                        icon: Icons.delete_outline,
                        iconColor: theme.colorScheme.error,
                        label: 'Delete File',
                        onTap: () {
                          Navigator.pop(context);
                          state.deleteDocument(doc.id);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('File "${doc.title}" deleted.')),
                          );
                        },
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: AppTokens.stackSm),
          ],
        ),
      );
    },
  );
}

Widget _buildOptionRow(
  BuildContext context, {
  required IconData icon,
  required String label,
  required VoidCallback onTap,
  Color? iconColor,
}) {
  final theme = Theme.of(context);
  return InkWell(
    onTap: onTap,
    child: Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Row(
        children: [
          Icon(icon, color: iconColor ?? theme.colorScheme.secondary, size: 22),
          const SizedBox(width: AppTokens.gutter),
          Text(
            label,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurface,
            ),
          ),
        ],
      ),
    ),
  );
}
